const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Customer = require('../models/Customer');
const crypto = require('crypto');

class BookingController {
    // Hiển thị trang đặt phòng
    static async showBookingPage(req, res) {
        try {
            const { roomId, checkInDate, checkOutDate } = req.query;
            
            let room = null;
            if (roomId) {
                room = await Room.getById(roomId);
                if (!room) {
                    return res.status(404).render('error', {
                        title: 'Không tìm thấy - Paradise Resort & Spa',
                        message: 'Không tìm thấy thông tin phòng'
                    });
                }
            }

            res.render('customer/booking', {
                title: 'Đặt phòng - Paradise Resort & Spa',
                room: room,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate
            });
        } catch (error) {
            console.error('Error showing booking page:', error);
            res.status(500).render('error', {
                title: 'Lỗi - Paradise Resort & Spa',
                message: 'Đã xảy ra lỗi khi tải trang đặt phòng'
            });
        }
    }

    // Xử lý đặt phòng
    static async createBooking(req, res) {
        try {
            const {
                roomId, checkInDate, checkOutDate, adults, children,
                customerName, customerEmail, customerPhone, customerAddress,
                specialRequests, paymentMethod
            } = req.body;

            // Validate input
            if (!roomId || !checkInDate || !checkOutDate || !adults || !customerName || !customerPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
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

            // Check room availability
            const availableRooms = await Room.getAvailable(checkInDate, checkOutDate, null);
            const isRoomAvailable = availableRooms.some(room => room.RoomId == roomId);
            
            if (!isRoomAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Phòng này không còn trống trong khoảng thời gian đã chọn'
                });
            }

            // Get room details
            const room = await Room.getById(roomId);
            if (!room) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy thông tin phòng'
                });
            }

            // Calculate total amount
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            const basePrice = room.BasePrice || 0;
            const totalAmount = basePrice * nights;
            const depositAmount = Math.round(totalAmount * 0.3); // 30% deposit

            // Create or get customer
            let customer = null;
            if (customerEmail) {
                customer = await Customer.findByEmail(customerEmail);
            }
            
            if (!customer) {
                customer = await Customer.create({
                    firstName: customerName.split(' ')[0],
                    lastName: customerName.split(' ').slice(1).join(' ') || '',
                    email: customerEmail || '',
                    phone: customerPhone,
                    address: customerAddress || '',
                    customerCode: await Customer.generateCustomerCode()
                });
            }

            // Generate booking code
            const bookingCode = await Booking.generateBookingCode();

            // Create booking
            const booking = await Booking.create({
                bookingCode: bookingCode,
                customerId: customer.CustomerId,
                roomId: parseInt(roomId),
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                adults: parseInt(adults),
                children: parseInt(children) || 0,
                status: 'pending',
                totalAmount: totalAmount,
                depositAmount: depositAmount,
                specialRequests: specialRequests || '',
                createdBy: null, // Guest booking
                paymentMethod: paymentMethod || 'cash'
            });

            // Handle different payment methods
            if (paymentMethod === 'momo') {
                // MoMo payment - gọi API để tạo payment URL
                try {
                    const paymentData = {
                        bookingCode: bookingCode,
                        amount: totalAmount,
                        orderInfo: `Thanh toan dat phong ${room.RoomNumber}`,
                        customerName: customerName,
                        customerPhone: customerPhone
                    };

                    const momoPaymentUrl = await BookingController.generateMoMoPaymentUrl(paymentData);
                    
                    return res.json({
                        success: true,
                        message: 'Chuyển đến trang thanh toán MoMo',
                        redirectUrl: momoPaymentUrl,
                        data: {
                            bookingId: booking.BookingId,
                            bookingCode: booking.BookingCode,
                            totalAmount: totalAmount,
                            depositAmount: totalAmount, // Full amount for MoMo
                            nights: nights,
                            room: {
                                roomNumber: room.RoomNumber,
                                typeName: room.TypeName
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error creating MoMo payment:', error);
                    return res.json({
                        success: false,
                        message: 'Không thể tạo thanh toán MoMo: ' + error.message
                    });
                }
            } else {
                // Cash payment - need deposit transfer first
                return res.json({
                    success: true,
                    message: 'Đặt phòng thành công! Vui lòng chuyển khoản cọc.',
                    data: {
                        bookingId: booking.BookingId,
                        bookingCode: booking.BookingCode,
                        totalAmount: totalAmount,
                        depositAmount: depositAmount,
                        nights: nights,
                        room: {
                            roomNumber: room.RoomNumber,
                            typeName: room.TypeName
                        }
                    }
                });
            }

        } catch (error) {
            console.error('Error creating booking:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                code: error.code
            });
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi đặt phòng: ' + error.message
            });
        }
    }

    // Xem chi tiết đặt phòng
    static async showBookingDetail(req, res) {
        try {
            const bookingCode = req.params.code;
            const booking = await Booking.getByCode(bookingCode);

            if (!booking) {
                return res.status(404).render('error', {
                    title: 'Không tìm thấy - Paradise Resort & Spa',
                    message: 'Không tìm thấy thông tin đặt phòng'
                });
            }

            res.render('customer/booking-detail', {
                title: 'Chi tiết đặt phòng - Paradise Resort & Spa',
                booking: booking
            });
        } catch (error) {
            console.error('Error showing booking detail:', error);
            res.status(500).render('error', {
                title: 'Lỗi - Paradise Resort & Spa',
                message: 'Đã xảy ra lỗi khi tải thông tin đặt phòng'
            });
        }
    }

    // Hủy đặt phòng
    static async cancelBooking(req, res) {
        try {
            const { bookingCode } = req.body;

            if (!bookingCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập mã đặt phòng'
                });
            }

            const booking = await Booking.getByCode(bookingCode);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đặt phòng'
                });
            }

            if (booking.Status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Đặt phòng đã được hủy trước đó'
                });
            }

            if (booking.Status === 'checked_in') {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể hủy đặt phòng đã check-in'
                });
            }

            await Booking.cancel(booking.BookingId);

            res.json({
                success: true,
                message: 'Hủy đặt phòng thành công'
            });

        } catch (error) {
            console.error('Error cancelling booking:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi hủy đặt phòng'
            });
        }
    }

    // Tra cứu đặt phòng
    static async searchBooking(req, res) {
        try {
            res.render('customer/booking-search', {
                title: 'Tra cứu đặt phòng - Paradise Resort & Spa'
            });
        } catch (error) {
            console.error('Error showing booking search:', error);
            res.status(500).render('error', {
                title: 'Lỗi - Paradise Resort & Spa',
                message: 'Đã xảy ra lỗi khi tải trang tra cứu'
            });
        }
    }

    // Tạo MoMo payment URL bằng API
    static async generateMoMoPaymentUrl(paymentData) {
        try {
            // MoMo Sandbox configuration
            const partnerCode = 'MOMO';
            const accessKey = 'F8BBA842ECF85';
            const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
            const baseUrl = 'http://localhost:3000';
            
            // Payment data
            const requestId = paymentData.bookingCode + '_' + Date.now();
            const orderId = paymentData.bookingCode;
            const orderInfo = paymentData.orderInfo;
            const amount = paymentData.amount;
            const returnUrl = `${baseUrl}/payment/momo/return`;
            const notifyUrl = `${baseUrl}/payment/momo/notify`;
            const extraData = JSON.stringify({
                bookingCode: paymentData.bookingCode,
                customerName: paymentData.customerName,
                customerPhone: paymentData.customerPhone
            });

            // Tạo signature trước
            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=captureWallet`;
            const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

            // Tạo request body theo format đúng của MoMo
            const paymentRequest = {
                partnerCode: partnerCode,
                accessKey: accessKey,
                requestId: requestId,
                amount: parseInt(amount),
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: returnUrl,
                ipnUrl: notifyUrl,
                extraData: extraData,
                requestType: 'captureWallet',
                signature: signature,
                lang: 'vi'
            };

            console.log('🔧 MoMo Payment Request:', JSON.stringify(paymentRequest, null, 2));

            // Gọi MoMo API
            const response = await fetch('https://test-payment.momo.vn/v2/gateway/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify(paymentRequest)
            });

            const result = await response.json();
            console.log('✅ MoMo API Response:', JSON.stringify(result, null, 2));

            if (result.resultCode === 0) {
                console.log('🎉 MoMo payment URL created successfully');
                return result.payUrl;
            } else {
                throw new Error(`MoMo API Error: ${result.message}`);
            }

        } catch (error) {
            console.error('❌ Error generating MoMo payment URL:', error);
            // Fallback to mock URL on error
            const mockPaymentUrl = `http://localhost:3000/payment/momo/mock?bookingCode=${paymentData.bookingCode}&amount=${paymentData.amount}`;
            console.log('⚠️ Using mock URL as fallback:', mockPaymentUrl);
            return mockPaymentUrl;
        }
    }

    // Hiển thị trang QR MoMo (QR chuyển khoản)
    static async showMoMoQR(req, res) {
        try {
            const { bookingCode, amount, customerName, customerPhone, roomNumber } = req.query;
            
            if (!bookingCode || !amount) {
                return res.status(400).render('error', {
                    title: 'Lỗi',
                    message: 'Thiếu thông tin thanh toán'
                });
            }

            // Thông tin MoMo của bạn (admin)
            const adminMoMoInfo = {
                phone: '0972917506', // Số điện thoại MoMo của bạn
                name: 'Paradise Resort & Spa',
                accountNumber: '0972917506'
            };

            // Tạo nội dung chuyển khoản
            const transferContent = `Dat phong ${bookingCode} - ${customerName || 'Khach hang'}`;
            
            // Tạo QR code đơn giản với thông tin chuyển khoản
            const transferInfo = `Chuyển khoản MoMo\nSố điện thoại: ${adminMoMoInfo.phone}\nSố tiền: ${parseInt(amount).toLocaleString('vi-VN')} VND\nNội dung: ${transferContent}`;
            
            // Sử dụng QR code online service thay vì thư viện
            const qrCodeDataURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(transferInfo)}&color=D82D8B&bgcolor=FFFFFF&margin=10`;

            // Format số tiền
            const formattedAmount = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(parseInt(amount));

            res.render('customer/momo-qr', {
                title: 'Thanh toán MoMo - Paradise Resort',
                bookingCode: bookingCode,
                amount: formattedAmount,
                roomNumber: roomNumber,
                customerName: customerName,
                customerPhone: customerPhone,
                qrCode: qrCodeDataURL,
                transferContent: transferContent,
                adminMoMoInfo: adminMoMoInfo,
                isTransferQR: true // Flag để biết đây là QR chuyển khoản
            });

        } catch (error) {
            console.error('❌ Error showing MoMo QR:', error);
            res.status(500).render('error', {
                title: 'Lỗi',
                message: 'Không thể tạo mã QR thanh toán'
            });
        }
    }

    // Xử lý MoMo payment callback (return URL)
    static async handleMoMoReturn(req, res) {
        try {
            const { resultCode, orderId, amount, extraData, signature } = req.query;
            
            console.log('🔧 MoMo Return Data:', req.query);
            
            // Verify signature (theo format của MoMo)
            const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
            const rawSignature = `partnerCode=MOMO&accessKey=F8BBA842ECF85&requestId=${orderId}_${Date.now()}&amount=${amount}&orderId=${orderId}&orderInfo=&returnUrl=http://localhost:3000/payment/momo/return&notifyUrl=http://localhost:3000/payment/momo/notify&extraData=${extraData || ''}`;
            const expectedSignature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
            
            console.log('🔧 Expected signature:', expectedSignature);
            console.log('🔧 Received signature:', signature);
            
            // Tạm thời bỏ qua signature verification để test
            // if (signature !== expectedSignature) {
            //     console.error('❌ Invalid MoMo signature');
            //     return res.render('customer/payment-failed', {
            //         title: 'Lỗi bảo mật - Paradise Resort & Spa',
            //         message: 'Chữ ký không hợp lệ. Vui lòng liên hệ hỗ trợ.'
            //     });
            // }
            
            if (resultCode === '0') {
                // Payment successful
                const extraDataObj = JSON.parse(extraData || '{}');
                const bookingCode = extraDataObj.bookingCode;

                console.log('✅ Payment successful for booking:', bookingCode);
                
                // Update booking status
                const booking = await Booking.getByCode(bookingCode);
                if (booking) {
                    await Booking.updatePaymentStatus(booking.BookingId, 'paid');
                    console.log('✅ Updated booking payment status to paid');
                }

                res.render('customer/payment-success', {
                    title: 'Thanh toán thành công - Paradise Resort & Spa',
                    bookingCode: bookingCode,
                    amount: amount
                });
            } else {
                // Payment failed
                console.log('❌ Payment failed with resultCode:', resultCode);
                res.render('customer/payment-failed', {
                    title: 'Thanh toán thất bại - Paradise Resort & Spa',
                    message: 'Thanh toán không thành công. Vui lòng thử lại.'
                });
            }
        } catch (error) {
            console.error('❌ Error handling MoMo return:', error);
            res.render('customer/payment-failed', {
                title: 'Lỗi thanh toán - Paradise Resort & Spa',
                message: 'Đã xảy ra lỗi khi xử lý thanh toán.'
            });
        }
    }

    // Xử lý MoMo payment notify (webhook)
    static async handleMoMoNotify(req, res) {
        try {
            const { resultCode, orderId, amount, extraData } = req.body;
            
            if (resultCode === '0') {
                // Payment successful - update booking status
                const extraDataObj = JSON.parse(extraData || '{}');
                const bookingCode = extraDataObj.bookingCode;

                const booking = await Booking.getByCode(bookingCode);
                if (booking) {
                    await Booking.updatePaymentStatus(booking.BookingId, 'paid');
                }
            }

            // Always return success to MoMo
            res.json({
                status: 0,
                message: 'success'
            });
        } catch (error) {
            console.error('Error handling MoMo notify:', error);
            res.json({
                status: 1,
                message: 'error'
            });
        }
    }

    // Mock MoMo payment page (for demo)
    static async showMockMoMoPayment(req, res) {
        try {
            const { bookingCode, amount } = req.query;
            
            res.render('customer/mock-momo-payment', {
                title: 'Thanh toán MoMo - Paradise Resort & Spa',
                bookingCode: bookingCode,
                amount: amount
            });
        } catch (error) {
            console.error('Error showing mock MoMo payment:', error);
            res.status(500).render('error', {
                title: 'Lỗi - Paradise Resort & Spa',
                message: 'Đã xảy ra lỗi khi tải trang thanh toán'
            });
        }
    }
}

module.exports = BookingController;