const { query } = require('../config/db');

class ServiceController {
    // Hiển thị trang dịch vụ
    static async showServices(req, res) {
        try {
            // Lấy danh sách dịch vụ từ database (nếu có bảng Services)
            // Tạm thời sử dụng dữ liệu tĩnh
            const services = [
                {
                    id: 1,
                    name: 'Spa & Wellness',
                    icon: 'fas fa-spa',
                    description: 'Massage, facial, body treatment với các chuyên gia hàng đầu.',
                    features: ['Massage trị liệu', 'Facial chăm sóc da', 'Body treatment', 'Yoga & Meditation'],
                    price: 'Từ 500,000 VNĐ'
                },
                {
                    id: 2,
                    name: 'Hồ bơi',
                    icon: 'fas fa-swimming-pool',
                    description: 'Hồ bơi vô cực với view biển tuyệt đẹp, mở cửa 24/7.',
                    features: ['Hồ bơi vô cực', 'View biển 360°', 'Mở cửa 24/7', 'Dịch vụ bar bên hồ'],
                    price: 'Miễn phí cho khách lưu trú'
                },
                {
                    id: 3,
                    name: 'Gym & Fitness',
                    icon: 'fas fa-dumbbell',
                    description: 'Phòng gym hiện đại với đầy đủ thiết bị, mở cửa 24/7.',
                    features: ['Thiết bị hiện đại', 'Personal trainer', 'Mở cửa 24/7', 'Yoga class'],
                    price: 'Miễn phí cho khách lưu trú'
                },
                {
                    id: 4,
                    name: 'Concierge',
                    icon: 'fas fa-concierge-bell',
                    description: 'Dịch vụ hỗ trợ 24/7, đặt tour, vé máy bay, taxi.',
                    features: ['Hỗ trợ 24/7', 'Đặt tour du lịch', 'Đặt vé máy bay', 'Thuê xe riêng'],
                    price: 'Phí dịch vụ theo yêu cầu'
                },
                {
                    id: 5,
                    name: 'Nhà hàng',
                    icon: 'fas fa-utensils',
                    description: 'Ẩm thực Việt Nam và quốc tế với nguyên liệu tươi ngon.',
                    features: ['Ẩm thực Việt Nam', 'Món Âu sang trọng', 'Buffet sáng', 'Room service 24/7'],
                    price: 'Menu đa dạng từ 200,000 VNĐ'
                },
                {
                    id: 6,
                    name: 'Xe đưa đón',
                    icon: 'fas fa-car',
                    description: 'Dịch vụ xe đưa đón sân bay và các điểm du lịch.',
                    features: ['Đưa đón sân bay', 'Thuê xe riêng', 'Tour trong ngày', 'Xe sang trọng'],
                    price: 'Từ 800,000 VNĐ/chuyến'
                }
            ];

            res.render('customer/services', {
                title: 'Dịch vụ - Paradise Resort & Spa',
                content: 'customer/services-content',
                services: services
            });
        } catch (error) {
            console.error('Error showing services:', error);
            res.status(500).render('error', {
                title: 'Lỗi - Paradise Resort & Spa',
                message: 'Đã xảy ra lỗi khi tải danh sách dịch vụ'
            });
        }
    }

    // Hiển thị chi tiết dịch vụ
    static async showServiceDetail(req, res) {
        try {
            const serviceId = req.params.id;
            
            // Tạm thời sử dụng dữ liệu tĩnh
            const services = {
                1: {
                    id: 1,
                    name: 'Spa & Wellness',
                    icon: 'fas fa-spa',
                    description: 'Massage, facial, body treatment với các chuyên gia hàng đầu.',
                    features: ['Massage trị liệu', 'Facial chăm sóc da', 'Body treatment', 'Yoga & Meditation'],
                    price: 'Từ 500,000 VNĐ',
                    details: 'Trải nghiệm sự thư giãn tuyệt đối tại spa cao cấp của chúng tôi. Với đội ngũ chuyên gia giàu kinh nghiệm và các liệu pháp spa hiện đại, chúng tôi cam kết mang đến cho bạn những giây phút nghỉ ngơi hoàn hảo.',
                    packages: [
                        { name: 'Massage Relaxing', duration: '60 phút', price: '500,000 VNĐ' },
                        { name: 'Facial Treatment', duration: '90 phút', price: '800,000 VNĐ' },
                        { name: 'Full Body Spa', duration: '120 phút', price: '1,200,000 VNĐ' }
                    ]
                }
            };

            const service = services[serviceId];
            
            if (!service) {
                return res.status(404).render('error', {
                    title: 'Không tìm thấy - Paradise Resort & Spa',
                    message: 'Không tìm thấy thông tin dịch vụ'
                });
            }

            res.render('customer/service-detail', {
                title: `${service.name} - Paradise Resort & Spa`,
                service: service
            });
        } catch (error) {
            console.error('Error showing service detail:', error);
            res.status(500).render('error', {
                title: 'Lỗi - Paradise Resort & Spa',
                message: 'Đã xảy ra lỗi khi tải thông tin dịch vụ'
            });
        }
    }

    // Đặt dịch vụ
    static async bookService(req, res) {
        try {
            const { serviceId, bookingDate, timeSlot, customerName, customerPhone, customerEmail, notes } = req.body;
            
            // Validate input
            if (!serviceId || !bookingDate || !timeSlot || !customerName || !customerPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
                });
            }

            // Tạm thời trả về thành công (sẽ implement database sau)
            res.json({
                success: true,
                message: 'Đặt dịch vụ thành công! Chúng tôi sẽ liên hệ lại để xác nhận.',
                data: {
                    serviceId,
                    bookingDate,
                    timeSlot,
                    customerName,
                    customerPhone,
                    customerEmail,
                    notes
                }
            });
        } catch (error) {
            console.error('Error booking service:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi đặt dịch vụ'
            });
        }
    }

    // Lấy danh sách dịch vụ (API)
    static async getServices(req, res) {
        try {
            // Tạm thời trả về dữ liệu tĩnh
            const services = [
                { id: 1, name: 'Spa & Wellness', price: 'Từ 500,000 VNĐ' },
                { id: 2, name: 'Hồ bơi', price: 'Miễn phí' },
                { id: 3, name: 'Gym & Fitness', price: 'Miễn phí' },
                { id: 4, name: 'Concierge', price: 'Theo yêu cầu' },
                { id: 5, name: 'Nhà hàng', price: 'Từ 200,000 VNĐ' },
                { id: 6, name: 'Xe đưa đón', price: 'Từ 800,000 VNĐ' }
            ];

            res.json({
                success: true,
                data: services
            });
        } catch (error) {
            console.error('Error getting services:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi tải danh sách dịch vụ'
            });
        }
    }
}

module.exports = ServiceController;

