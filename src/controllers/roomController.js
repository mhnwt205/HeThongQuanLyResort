const Room = require('../models/Room');

class RoomController {
    // Hiển thị trang danh sách phòng
    static async showRooms(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 9;
            
            // Lấy danh sách phòng
            const rooms = await Room.getAll(page, limit);
            const roomTypes = await Room.getRoomTypes();
            const stats = await Room.getStatistics();
            
            res.render('customer/rooms', {
                title: 'Phòng nghỉ - Paradise Resort & Spa',
                content: 'customer/rooms-content',
                rooms: rooms,
                roomTypes: roomTypes,
                stats: stats,
                currentPage: page,
                hasNextPage: rooms.length === limit
            });
        } catch (error) {
            console.error('Error showing rooms:', error);
            
            // Fallback: hiển thị dữ liệu mẫu khi DB lỗi
            const mockRooms = [
                {
                    RoomId: 1,
                    RoomNumber: '101',
                    TypeName: 'Deluxe Ocean View',
                    BasePrice: 2500000,
                    MaxOccupancy: 2,
                    Status: 'available',
                    FloorNumber: 1
                },
                {
                    RoomId: 2,
                    RoomNumber: '201',
                    TypeName: 'Executive Suite',
                    BasePrice: 4500000,
                    MaxOccupancy: 4,
                    Status: 'available',
                    FloorNumber: 2
                },
                {
                    RoomId: 3,
                    RoomNumber: 'V01',
                    TypeName: 'Presidential Villa',
                    BasePrice: 8500000,
                    MaxOccupancy: 6,
                    Status: 'available',
                    FloorNumber: 0
                }
            ];
            
            res.render('customer/rooms', {
                title: 'Phòng nghỉ - Paradise Resort & Spa',
                content: 'customer/rooms-content',
                rooms: mockRooms,
                roomTypes: [],
                stats: { total: 3, available: 3 },
                currentPage: 1,
                hasNextPage: false,
                dbError: true
            });
        }
    }

    // Hiển thị chi tiết phòng
    static async showRoomDetail(req, res) {
        try {
            const roomId = req.params.id;
            const room = await Room.getById(roomId);
            
            if (!room) {
                return res.status(404).render('error', {
                    title: 'Không tìm thấy - Paradise Resort & Spa',
                    message: 'Không tìm thấy thông tin phòng'
                });
            }

            res.render('customer/room-detail', {
                title: `Phòng ${room.RoomNumber} - Paradise Resort & Spa`,
                room: room
            });
        } catch (error) {
            console.error('Error showing room detail:', error);
            res.status(500).render('error', {
                title: 'Lỗi - Paradise Resort & Spa',
                message: 'Đã xảy ra lỗi khi tải thông tin phòng'
            });
        }
    }

    // Tìm phòng trống (cho chức năng đặt phòng)
    static async searchAvailableRooms(req, res) {
        try {
            const { checkInDate, checkOutDate, roomTypeId, guests } = req.query;
            
            if (!checkInDate || !checkOutDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn ngày check-in và check-out'
                });
            }

            // Validate dates
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (checkIn < today) {
                return res.status(400).json({
                    success: false,
                    message: 'Ngày check-in không thể là ngày quá khứ'
                });
            }

            if (checkOut <= checkIn) {
                return res.status(400).json({
                    success: false,
                    message: 'Ngày check-out phải sau ngày check-in'
                });
            }

            // Tìm phòng trống
            const availableRooms = await Room.getAvailable(checkInDate, checkOutDate, roomTypeId);
            
            // Lọc theo số khách nếu có
            let filteredRooms = availableRooms;
            if (guests) {
                filteredRooms = availableRooms.filter(room => room.MaxOccupancy >= parseInt(guests));
            }

            res.json({
                success: true,
                data: filteredRooms,
                searchParams: {
                    checkInDate,
                    checkOutDate,
                    roomTypeId,
                    guests
                }
            });
        } catch (error) {
            console.error('Error searching available rooms:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi tìm phòng'
            });
        }
    }

    // Lấy danh sách loại phòng (API)
    static async getRoomTypes(req, res) {
        try {
            const roomTypes = await Room.getRoomTypes();
            res.json({
                success: true,
                data: roomTypes
            });
        } catch (error) {
            console.error('Error getting room types:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi tải danh sách loại phòng'
            });
        }
    }

    // Hiển thị trang tìm kiếm phòng
    static async showRoomSearch(req, res) {
        try {
            const roomTypes = await Room.getRoomTypes();
            
            res.render('customer/room-search', {
                title: 'Tìm kiếm phòng - Paradise Resort & Spa',
                roomTypes: roomTypes,
                searchParams: req.query
            });
        } catch (error) {
            console.error('Error showing room search:', error);
            res.status(500).render('error', {
                title: 'Lỗi - Paradise Resort & Spa',
                message: 'Đã xảy ra lỗi khi tải trang tìm kiếm'
            });
        }
    }
}

module.exports = RoomController;

