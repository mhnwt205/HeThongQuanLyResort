const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');

/**
 * Booking Controller - Xử lý logic đặt phòng
 */
class BookingController {
    /**
     * Lấy tất cả đặt phòng
     * GET /api/bookings
     */
    static async getAllBookings(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;

            let bookings;
            if (status) {
                bookings = await Booking.getByStatus(status);
            } else {
                bookings = await Booking.getAll(page, limit);
            }

            res.json({
                success: true,
                data: bookings,
                pagination: {
                    page,
                    limit,
                    total: bookings.length
                }
            });
        } catch (error) {
            console.error('Error getting bookings:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Lấy đặt phòng theo ID
     * GET /api/bookings/:id
     */
    static async getBookingById(req, res) {
        try {
            const { id } = req.params;
            const booking = await Booking.getById(id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            res.json({
                success: true,
                data: booking
            });
        } catch (error) {
            console.error('Error getting booking:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Tạo đặt phòng mới
     * POST /api/bookings
     */
    static async createBooking(req, res) {
        try {
            const {
                customerId, roomId, checkInDate, checkOutDate,
                adults, children, specialRequests
            } = req.body;

            // Kiểm tra khách hàng tồn tại
            const customer = await Customer.getById(customerId);
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            // Kiểm tra phòng có sẵn
            const availableRooms = await Room.getAvailable(checkInDate, checkOutDate);
            const isRoomAvailable = availableRooms.some(room => room.RoomId === roomId);
            
            if (!isRoomAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Room is not available for the selected dates'
                });
            }

            // Tạo mã đặt phòng
            const bookingCode = await Booking.generateBookingCode();

            // Tính tổng tiền (có thể tính dựa trên loại phòng và số đêm)
            const room = await Room.getById(roomId);
            const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
            const totalAmount = room.BasePrice * nights;

            const bookingData = {
                bookingCode,
                customerId,
                roomId,
                checkInDate,
                checkOutDate,
                adults: adults || 1,
                children: children || 0,
                status: 'pending',
                totalAmount,
                depositAmount: totalAmount * 0.3, // 30% deposit
                specialRequests,
                createdBy: req.user.userId
            };

            const booking = await Booking.create(bookingData);

            res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: booking
            });
        } catch (error) {
            console.error('Error creating booking:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Cập nhật đặt phòng
     * PUT /api/bookings/:id
     */
    static async updateBooking(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Kiểm tra đặt phòng tồn tại
            const existingBooking = await Booking.getById(id);
            if (!existingBooking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Không cho phép cập nhật nếu đã check-in hoặc check-out
            if (['checked_in', 'checked_out', 'cancelled'].includes(existingBooking.Status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot update booking in current status'
                });
            }

            const booking = await Booking.update(id, updateData);

            res.json({
                success: true,
                message: 'Booking updated successfully',
                data: booking
            });
        } catch (error) {
            console.error('Error updating booking:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Hủy đặt phòng
     * DELETE /api/bookings/:id
     */
    static async cancelBooking(req, res) {
        try {
            const { id } = req.params;

            // Kiểm tra đặt phòng tồn tại
            const existingBooking = await Booking.getById(id);
            if (!existingBooking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Không cho phép hủy nếu đã check-in hoặc check-out
            if (['checked_in', 'checked_out'].includes(existingBooking.Status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot cancel booking in current status'
                });
            }

            const booking = await Booking.cancel(id);

            res.json({
                success: true,
                message: 'Booking cancelled successfully',
                data: booking
            });
        } catch (error) {
            console.error('Error cancelling booking:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Check-in
     * POST /api/bookings/:id/checkin
     */
    static async checkIn(req, res) {
        try {
            const { id } = req.params;
            const { actualAdults, actualChildren } = req.body;

            // Kiểm tra đặt phòng tồn tại
            const booking = await Booking.getById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Kiểm tra trạng thái đặt phòng
            if (booking.Status !== 'confirmed') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking must be confirmed before check-in'
                });
            }

            const checkInResult = await Booking.checkIn(
                id,
                booking.RoomId,
                actualAdults || booking.Adults,
                actualChildren || booking.Children,
                req.user.userId
            );

            res.json({
                success: true,
                message: 'Check-in successful',
                data: {
                    bookingId: id,
                    checkInId: checkInResult.CheckInId,
                    checkInTime: new Date()
                }
            });
        } catch (error) {
            console.error('Error checking in:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Check-out
     * POST /api/bookings/:id/checkout
     */
    static async checkOut(req, res) {
        try {
            const { id } = req.params;

            // Kiểm tra đặt phòng tồn tại
            const booking = await Booking.getById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Kiểm tra trạng thái đặt phòng
            if (booking.Status !== 'checked_in') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking must be checked-in before check-out'
                });
            }

            const bookingResult = await Booking.checkOut(id, booking.RoomId, req.user.userId);

            // Tạo hóa đơn tự động khi check-out
            const invoiceNumber = await Invoice.generateInvoiceNumber();
            const invoiceData = {
                invoiceNumber,
                customerId: booking.CustomerId,
                bookingId: id,
                invoiceDate: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                subtotal: booking.TotalAmount,
                taxAmount: booking.TotalAmount * 0.1, // 10% VAT
                discountAmount: 0,
                totalAmount: booking.TotalAmount * 1.1,
                status: 'draft',
                notes: 'Auto-generated invoice on check-out',
                createdBy: req.user.userId
            };

            const invoice = await Invoice.create(invoiceData);

            // Thêm chi tiết hóa đơn cho phòng
            await Invoice.addItem(invoice.InvoiceId, {
                itemType: 'room',
                itemName: `Room ${booking.RoomNumber} - ${booking.CheckInDate} to ${booking.CheckOutDate}`,
                description: 'Room accommodation',
                quantity: 1,
                unitPrice: booking.TotalAmount,
                totalPrice: booking.TotalAmount
            });

            res.json({
                success: true,
                message: 'Check-out successful',
                data: {
                    booking: bookingResult,
                    invoice: invoice
                }
            });
        } catch (error) {
            console.error('Error checking out:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Lấy phòng trống
     * GET /api/bookings/available-rooms
     */
    static async getAvailableRooms(req, res) {
        try {
            const { checkInDate, checkOutDate, roomTypeId } = req.query;

            if (!checkInDate || !checkOutDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Check-in date and check-out date are required'
                });
            }

            const availableRooms = await Room.getAvailable(
                checkInDate,
                checkOutDate,
                roomTypeId ? parseInt(roomTypeId) : null
            );

            res.json({
                success: true,
                data: availableRooms
            });
        } catch (error) {
            console.error('Error getting available rooms:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Lấy đặt phòng theo ngày
     * GET /api/bookings/by-date/:date
     */
    static async getBookingsByDate(req, res) {
        try {
            const { date } = req.params;
            const bookings = await Booking.getByDate(date);

            res.json({
                success: true,
                data: bookings
            });
        } catch (error) {
            console.error('Error getting bookings by date:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = BookingController;

