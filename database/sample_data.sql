-- =============================================
-- SAMPLE DATA FOR RESORT MANAGEMENT SYSTEM
-- =============================================

USE resort_management;

-- =============================================
-- 1. INSERT ROLES
-- =============================================
INSERT INTO roles (role_name, description) VALUES
('admin', 'Quản trị viên hệ thống'),
('manager', 'Quản lý'),
('receptionist', 'Nhân viên lễ tân'),
('housekeeping', 'Nhân viên buồng phòng'),
('accountant', 'Kế toán'),
('cashier', 'Thu ngân'),
('sales', 'Nhân viên kinh doanh'),
('spa_staff', 'Nhân viên spa'),
('restaurant_staff', 'Nhân viên nhà hàng'),
('maintenance', 'Nhân viên bảo trì');

-- =============================================
-- 2. INSERT DEPARTMENTS
-- =============================================
INSERT INTO departments (department_name, description) VALUES
('Quản lý', 'Ban quản lý resort'),
('Lễ tân', 'Bộ phận lễ tân và đón tiếp khách'),
('Buồng phòng', 'Bộ phận buồng phòng và dọn dẹp'),
('Kế toán', 'Bộ phận kế toán và tài chính'),
('Thu ngân', 'Bộ phận thu ngân'),
('Kinh doanh', 'Bộ phận kinh doanh và bán hàng'),
('Spa', 'Bộ phận spa và massage'),
('Nhà hàng', 'Bộ phận nhà hàng và bar'),
('Bảo trì', 'Bộ phận bảo trì và kỹ thuật'),
('Vật tư', 'Bộ phận quản lý vật tư và kho');

-- =============================================
-- 3. INSERT EMPLOYEES
-- =============================================
INSERT INTO employees (employee_code, first_name, last_name, email, phone, position, department_id, hire_date, salary, status) VALUES
('EMP001', 'Nguyễn', 'Văn An', 'an.nguyen@resort.com', '0901234567', 'Giám đốc', 1, '2020-01-15', 25000000, 'active'),
('EMP002', 'Trần', 'Thị Bình', 'binh.tran@resort.com', '0901234568', 'Trưởng phòng lễ tân', 2, '2020-03-01', 15000000, 'active'),
('EMP003', 'Lê', 'Văn Cường', 'cuong.le@resort.com', '0901234569', 'Nhân viên lễ tân', 2, '2021-06-15', 8000000, 'active'),
('EMP004', 'Phạm', 'Thị Dung', 'dung.pham@resort.com', '0901234570', 'Trưởng phòng buồng phòng', 3, '2020-02-01', 12000000, 'active'),
('EMP005', 'Hoàng', 'Văn Em', 'em.hoang@resort.com', '0901234571', 'Nhân viên buồng phòng', 3, '2021-08-01', 7000000, 'active'),
('EMP006', 'Vũ', 'Thị Phương', 'phuong.vu@resort.com', '0901234572', 'Kế toán trưởng', 4, '2020-01-01', 18000000, 'active'),
('EMP007', 'Đặng', 'Văn Giang', 'giang.dang@resort.com', '0901234573', 'Thu ngân', 5, '2021-03-01', 9000000, 'active'),
('EMP008', 'Bùi', 'Thị Hoa', 'hoa.bui@resort.com', '0901234574', 'Nhân viên kinh doanh', 6, '2021-05-01', 10000000, 'active'),
('EMP009', 'Ngô', 'Văn Ích', 'ich.ngo@resort.com', '0901234575', 'Nhân viên spa', 7, '2021-07-01', 8000000, 'active'),
('EMP010', 'Đinh', 'Thị Kim', 'kim.dinh@resort.com', '0901234576', 'Nhân viên nhà hàng', 8, '2021-09-01', 7500000, 'active');

-- =============================================
-- 4. INSERT USERS
-- =============================================
INSERT INTO users (username, password_hash, employee_id, role_id, is_active) VALUES
('admin', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 1, 1, TRUE),
('manager', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 1, 2, TRUE),
('receptionist1', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 2, 3, TRUE),
('receptionist2', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 3, 3, TRUE),
('housekeeping1', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 4, 4, TRUE),
('accountant1', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 6, 5, TRUE),
('cashier1', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 7, 6, TRUE),
('sales1', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 8, 7, TRUE);

-- =============================================
-- 5. INSERT PERMISSIONS
-- =============================================
INSERT INTO permissions (permission_name, description, module) VALUES
-- Customer Management
('view_customers', 'Xem thông tin khách hàng', 'customer'),
('create_customers', 'Tạo khách hàng mới', 'customer'),
('edit_customers', 'Chỉnh sửa thông tin khách hàng', 'customer'),
('delete_customers', 'Xóa khách hàng', 'customer'),

-- Reservation Management
('view_reservations', 'Xem đặt phòng', 'reservation'),
('create_reservations', 'Tạo đặt phòng mới', 'reservation'),
('edit_reservations', 'Chỉnh sửa đặt phòng', 'reservation'),
('cancel_reservations', 'Hủy đặt phòng', 'reservation'),
('check_in', 'Check-in khách', 'reservation'),
('check_out', 'Check-out khách', 'reservation'),

-- Room Management
('view_rooms', 'Xem thông tin phòng', 'room'),
('manage_rooms', 'Quản lý phòng', 'room'),
('assign_rooms', 'Gán phòng cho khách', 'room'),

-- Service Management
('view_services', 'Xem dịch vụ', 'service'),
('create_services', 'Tạo dịch vụ mới', 'service'),
('edit_services', 'Chỉnh sửa dịch vụ', 'service'),
('book_services', 'Đặt dịch vụ', 'service'),

-- Invoice Management
('view_invoices', 'Xem hóa đơn', 'invoice'),
('create_invoices', 'Tạo hóa đơn', 'invoice'),
('edit_invoices', 'Chỉnh sửa hóa đơn', 'invoice'),
('process_payments', 'Xử lý thanh toán', 'invoice'),

-- Inventory Management
('view_inventory', 'Xem tồn kho', 'inventory'),
('manage_inventory', 'Quản lý tồn kho', 'inventory'),
('issue_stock', 'Xuất kho', 'inventory'),

-- Reports
('view_reports', 'Xem báo cáo', 'report'),
('create_reports', 'Tạo báo cáo', 'report'),
('export_reports', 'Xuất báo cáo', 'report'),

-- System Management
('manage_users', 'Quản lý người dùng', 'system'),
('manage_roles', 'Quản lý vai trò', 'system'),
('view_logs', 'Xem log hệ thống', 'system'),
('system_settings', 'Cài đặt hệ thống', 'system');

-- =============================================
-- 6. INSERT ROLE PERMISSIONS
-- =============================================
-- Admin có tất cả quyền
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 1, permission_id, 1 FROM permissions;

-- Manager có hầu hết quyền trừ system management
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 2, permission_id, 1 FROM permissions 
WHERE permission_name NOT IN ('manage_users', 'manage_roles', 'system_settings');

-- Receptionist có quyền quản lý khách hàng, đặt phòng, check-in/out
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 3, permission_id, 1 FROM permissions 
WHERE permission_name IN (
    'view_customers', 'create_customers', 'edit_customers',
    'view_reservations', 'create_reservations', 'edit_reservations', 'check_in', 'check_out',
    'view_rooms', 'assign_rooms',
    'view_services', 'book_services',
    'view_invoices', 'create_invoices'
);

-- Housekeeping có quyền quản lý phòng
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 4, permission_id, 1 FROM permissions 
WHERE permission_name IN ('view_rooms', 'manage_rooms', 'view_reservations');

-- Accountant có quyền quản lý tài chính
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 5, permission_id, 1 FROM permissions 
WHERE permission_name IN (
    'view_invoices', 'create_invoices', 'edit_invoices', 'process_payments',
    'view_reports', 'create_reports', 'export_reports',
    'view_customers', 'view_reservations'
);

-- Cashier có quyền xử lý thanh toán
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 6, permission_id, 1 FROM permissions 
WHERE permission_name IN (
    'view_invoices', 'create_invoices', 'process_payments',
    'view_customers', 'view_reservations'
);

-- Sales có quyền kinh doanh
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 7, permission_id, 1 FROM permissions 
WHERE permission_name IN (
    'view_customers', 'create_customers', 'edit_customers',
    'view_reservations', 'create_reservations', 'edit_reservations',
    'view_services', 'book_services'
);

-- =============================================
-- 7. INSERT CUSTOMERS
-- =============================================
INSERT INTO customers (customer_code, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, gender, customer_type, loyalty_points) VALUES
('CUST001', 'John', 'Smith', 'john.smith@email.com', '+1234567890', 'American', 'US123456789', '1985-03-15', 'male', 'individual', 150),
('CUST002', 'Maria', 'Garcia', 'maria.garcia@email.com', '+1234567891', 'Spanish', 'ES987654321', '1990-07-22', 'female', 'individual', 200),
('CUST003', '田中', '太郎', 'tanaka@email.com', '+81901234567', 'Japanese', 'JP123456789', '1988-11-08', 'male', 'vip', 500),
('CUST004', 'Nguyễn', 'Văn Nam', 'nam.nguyen@email.com', '0901234567', 'Vietnamese', 'VN123456789', '1992-05-12', 'male', 'individual', 75),
('CUST005', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '+1234567892', 'British', 'GB123456789', '1987-09-30', 'female', 'individual', 100),
('CUST006', 'ABC Corporation', 'Ltd', 'contact@abc-corp.com', '+1234567893', 'Singaporean', 'SG123456789', '2010-01-01', 'other', 'corporate', 1000),
('CUST007', '김', '민수', 'kim.minsu@email.com', '+82101234567', 'Korean', 'KR123456789', '1991-12-03', 'male', 'individual', 125),
('CUST008', 'Emma', 'Wilson', 'emma.wilson@email.com', '+1234567894', 'Australian', 'AU123456789', '1989-04-18', 'female', 'individual', 80);

-- =============================================
-- 8. INSERT ROOM TYPES
-- =============================================
INSERT INTO room_types (type_name, description, base_price, max_occupancy, amenities) VALUES
('Standard Room', 'Phòng tiêu chuẩn với view biển', 1500000, 2, 'WiFi, TV, Mini bar, Balcony'),
('Deluxe Room', 'Phòng deluxe với view biển và bồn tắm', 2500000, 2, 'WiFi, TV, Mini bar, Balcony, Bathtub, Sea view'),
('Suite', 'Suite cao cấp với phòng khách riêng', 4000000, 4, 'WiFi, TV, Mini bar, Balcony, Bathtub, Sea view, Living room, Kitchenette'),
('Presidential Suite', 'Suite tổng thống với đầy đủ tiện nghi', 8000000, 6, 'WiFi, TV, Mini bar, Balcony, Bathtub, Sea view, Living room, Kitchen, Butler service'),
('Villa', 'Villa riêng biệt với hồ bơi', 12000000, 8, 'WiFi, TV, Mini bar, Private pool, Garden, Kitchen, Butler service, Private beach access');

-- =============================================
-- 9. INSERT ROOMS
-- =============================================
INSERT INTO rooms (room_number, room_type_id, floor_number, status) VALUES
-- Standard Rooms (101-120)
('101', 1, 1, 'available'), ('102', 1, 1, 'available'), ('103', 1, 1, 'occupied'), ('104', 1, 1, 'available'),
('105', 1, 1, 'available'), ('106', 1, 1, 'maintenance'), ('107', 1, 1, 'available'), ('108', 1, 1, 'available'),
('109', 1, 1, 'available'), ('110', 1, 1, 'available'), ('111', 1, 1, 'available'), ('112', 1, 1, 'available'),
('113', 1, 1, 'available'), ('114', 1, 1, 'available'), ('115', 1, 1, 'available'), ('116', 1, 1, 'available'),
('117', 1, 1, 'available'), ('118', 1, 1, 'available'), ('119', 1, 1, 'available'), ('120', 1, 1, 'available'),

-- Deluxe Rooms (201-220)
('201', 2, 2, 'available'), ('202', 2, 2, 'occupied'), ('203', 2, 2, 'available'), ('204', 2, 2, 'available'),
('205', 2, 2, 'available'), ('206', 2, 2, 'available'), ('207', 2, 2, 'available'), ('208', 2, 2, 'available'),
('209', 2, 2, 'available'), ('210', 2, 2, 'available'), ('211', 2, 2, 'available'), ('212', 2, 2, 'available'),
('213', 2, 2, 'available'), ('214', 2, 2, 'available'), ('215', 2, 2, 'available'), ('216', 2, 2, 'available'),
('217', 2, 2, 'available'), ('218', 2, 2, 'available'), ('219', 2, 2, 'available'), ('220', 2, 2, 'available'),

-- Suites (301-310)
('301', 3, 3, 'available'), ('302', 3, 3, 'available'), ('303', 3, 3, 'available'), ('304', 3, 3, 'available'),
('305', 3, 3, 'available'), ('306', 3, 3, 'available'), ('307', 3, 3, 'available'), ('308', 3, 3, 'available'),
('309', 3, 3, 'available'), ('310', 3, 3, 'available'),

-- Presidential Suites (401-402)
('401', 4, 4, 'available'), ('402', 4, 4, 'available'),

-- Villas (V01-V05)
('V01', 5, 0, 'available'), ('V02', 5, 0, 'available'), ('V03', 5, 0, 'available'), ('V04', 5, 0, 'available'), ('V05', 5, 0, 'available');

-- =============================================
-- 10. INSERT ROOM PRICING
-- =============================================
INSERT INTO room_pricing (room_type_id, season_name, start_date, end_date, price) VALUES
-- High Season (Dec-Mar)
(1, 'High Season', '2024-12-01', '2025-03-31', 2000000),
(2, 'High Season', '2024-12-01', '2025-03-31', 3500000),
(3, 'High Season', '2024-12-01', '2025-03-31', 5500000),
(4, 'High Season', '2024-12-01', '2025-03-31', 12000000),
(5, 'High Season', '2024-12-01', '2025-03-31', 18000000),

-- Low Season (Apr-Nov)
(1, 'Low Season', '2024-04-01', '2024-11-30', 1200000),
(2, 'Low Season', '2024-04-01', '2024-11-30', 2000000),
(3, 'Low Season', '2024-04-01', '2024-11-30', 3200000),
(4, 'Low Season', '2024-04-01', '2024-11-30', 6000000),
(5, 'Low Season', '2024-04-01', '2024-11-30', 9000000);

-- =============================================
-- 11. INSERT SERVICE CATEGORIES
-- =============================================
INSERT INTO service_categories (category_name, description) VALUES
('Spa & Wellness', 'Dịch vụ spa và chăm sóc sức khỏe'),
('Restaurant & Bar', 'Dịch vụ nhà hàng và bar'),
('Recreation', 'Dịch vụ giải trí và thể thao'),
('Transportation', 'Dịch vụ vận chuyển'),
('Business Services', 'Dịch vụ kinh doanh'),
('Laundry & Cleaning', 'Dịch vụ giặt ủi và dọn dẹp'),
('Concierge', 'Dịch vụ lễ tân đặc biệt');

-- =============================================
-- 12. INSERT SERVICES
-- =============================================
INSERT INTO services (service_code, service_name, category_id, description, unit_price, unit) VALUES
-- Spa & Wellness
('SPA001', 'Massage Thái', 1, 'Massage Thái truyền thống 60 phút', 800000, 'session'),
('SPA002', 'Massage Đá Nóng', 1, 'Massage với đá nóng 90 phút', 1200000, 'session'),
('SPA003', 'Facial Treatment', 1, 'Chăm sóc da mặt cao cấp', 600000, 'session'),
('SPA004', 'Body Scrub', 1, 'Tẩy tế bào chết toàn thân', 500000, 'session'),

-- Restaurant & Bar
('RES001', 'Breakfast Buffet', 2, 'Buffet sáng cho 1 người', 200000, 'person'),
('RES002', 'Lunch Set Menu', 2, 'Set menu trưa cho 1 người', 350000, 'person'),
('RES003', 'Dinner à la carte', 2, 'Ăn tối theo thực đơn', 500000, 'person'),
('RES004', 'Room Service', 2, 'Dịch vụ phòng 24/7', 100000, 'order'),

-- Recreation
('REC001', 'Snorkeling Tour', 3, 'Tour lặn ống thở 3 giờ', 400000, 'person'),
('REC002', 'Kayaking', 3, 'Chèo thuyền kayak 2 giờ', 300000, 'person'),
('REC003', 'Tennis Court', 3, 'Thuê sân tennis 1 giờ', 200000, 'hour'),
('REC004', 'Gym Access', 3, 'Sử dụng phòng gym 1 ngày', 100000, 'day'),

-- Transportation
('TRA001', 'Airport Transfer', 4, 'Đưa đón sân bay', 500000, 'trip'),
('TRA002', 'City Tour', 4, 'Tour tham quan thành phố', 800000, 'person'),
('TRA003', 'Car Rental', 4, 'Thuê xe tự lái', 1000000, 'day'),

-- Business Services
('BUS001', 'Meeting Room', 5, 'Thuê phòng họp 4 giờ', 500000, 'session'),
('BUS002', 'Business Center', 5, 'Sử dụng trung tâm kinh doanh', 100000, 'hour'),
('BUS003', 'Secretarial Service', 5, 'Dịch vụ thư ký', 200000, 'hour'),

-- Laundry & Cleaning
('LAU001', 'Express Laundry', 6, 'Giặt ủi nhanh 2 giờ', 50000, 'kg'),
('LAU002', 'Dry Cleaning', 6, 'Giặt khô', 100000, 'item'),
('LAU003', 'Ironing Service', 6, 'Dịch vụ ủi đồ', 30000, 'item'),

-- Concierge
('CON001', 'Tour Booking', 7, 'Đặt tour du lịch', 0, 'service'),
('CON002', 'Restaurant Reservation', 7, 'Đặt bàn nhà hàng', 0, 'service'),
('CON003', 'Event Planning', 7, 'Lập kế hoạch sự kiện', 2000000, 'event');

-- =============================================
-- 13. INSERT RESERVATIONS
-- =============================================
INSERT INTO reservations (reservation_code, customer_id, room_type_id, check_in_date, check_out_date, adults, children, status, total_amount, deposit_amount, special_requests, created_by) VALUES
('RES001', 1, 2, '2024-12-15', '2024-12-18', 2, 0, 'confirmed', 10500000, 2000000, 'Honeymoon package, sea view room', 3),
('RES002', 2, 1, '2024-12-20', '2024-12-22', 1, 0, 'confirmed', 3000000, 500000, 'Late check-in after 10 PM', 3),
('RES003', 3, 4, '2024-12-25', '2024-12-30', 2, 1, 'confirmed', 60000000, 10000000, 'VIP treatment, airport transfer', 3),
('RES004', 4, 3, '2025-01-05', '2025-01-08', 2, 0, 'pending', 16500000, 0, 'Anniversary celebration', 8),
('RES005', 5, 2, '2025-01-10', '2025-01-12', 2, 0, 'confirmed', 7000000, 1000000, 'Business trip', 8),
('RES006', 6, 5, '2025-01-15', '2025-01-20', 4, 2, 'confirmed', 60000000, 15000000, 'Corporate retreat', 8);

-- =============================================
-- 14. INSERT RESERVATION ROOMS
-- =============================================
INSERT INTO reservation_rooms (reservation_id, room_id, assigned_by) VALUES
(1, 202, 3),
(2, 101, 3),
(3, 401, 3),
(5, 203, 3);

-- =============================================
-- 15. INSERT CHECK-INS
-- =============================================
INSERT INTO check_ins (reservation_id, room_id, check_in_time, actual_adults, actual_children, checked_in_by) VALUES
(1, 202, '2024-12-15 14:30:00', 2, 0, 3),
(2, 101, '2024-12-20 22:15:00', 1, 0, 3),
(3, 401, '2024-12-25 16:00:00', 2, 1, 3),
(5, 203, '2025-01-10 15:45:00', 2, 0, 3);

-- =============================================
-- 16. INSERT SERVICE BOOKINGS
-- =============================================
INSERT INTO service_bookings (booking_code, customer_id, service_id, booking_date, service_date, quantity, unit_price, total_amount, status, created_by) VALUES
('SER001', 1, 1, '2024-12-15', '2024-12-16', 2, 800000, 1600000, 'confirmed', 3),
('SER002', 1, 3, '2024-12-15', '2024-12-17', 1, 600000, 600000, 'confirmed', 3),
('SER003', 3, 1, '2024-12-25', '2024-12-26', 2, 800000, 1600000, 'confirmed', 3),
('SER004', 3, 2, '2024-12-25', '2024-12-27', 2, 1200000, 2400000, 'confirmed', 3),
('SER005', 5, 1, '2025-01-10', '2025-01-11', 1, 800000, 800000, 'pending', 8);

-- =============================================
-- 17. INSERT INVOICES
-- =============================================
INSERT INTO invoices (invoice_number, customer_id, reservation_id, invoice_date, due_date, subtotal, tax_amount, total_amount, status, created_by) VALUES
('INV001', 1, 1, '2024-12-18', '2024-12-18', 10500000, 1050000, 11550000, 'paid', 7),
('INV002', 2, 2, '2024-12-22', '2024-12-22', 3000000, 300000, 3300000, 'paid', 7),
('INV003', 3, 3, '2024-12-30', '2024-12-30', 60000000, 6000000, 66000000, 'paid', 7),
('INV004', 1, NULL, '2024-12-16', '2024-12-16', 1600000, 160000, 1760000, 'paid', 7),
('INV005', 1, NULL, '2024-12-17', '2024-12-17', 600000, 60000, 660000, 'paid', 7);

-- =============================================
-- 18. INSERT INVOICE ITEMS
-- =============================================
INSERT INTO invoice_items (invoice_id, item_type, item_name, description, quantity, unit_price, total_price) VALUES
-- Invoice 1 - Room charges
(1, 'room', 'Deluxe Room - 3 nights', 'Room 202, 3 nights stay', 3, 3500000, 10500000),

-- Invoice 2 - Room charges
(2, 'room', 'Standard Room - 2 nights', 'Room 101, 2 nights stay', 2, 1500000, 3000000),

-- Invoice 3 - Room charges
(3, 'room', 'Presidential Suite - 5 nights', 'Room 401, 5 nights stay', 5, 12000000, 60000000),

-- Invoice 4 - Spa services
(4, 'service', 'Massage Thái', '2 sessions of Thai massage', 2, 800000, 1600000),

-- Invoice 5 - Spa services
(5, 'service', 'Facial Treatment', '1 session of facial treatment', 1, 600000, 600000);

-- =============================================
-- 19. INSERT PAYMENTS
-- =============================================
INSERT INTO payments (payment_number, invoice_id, payment_date, amount, payment_method, processed_by) VALUES
('PAY001', 1, '2024-12-18', 11550000, 'credit_card', 7),
('PAY002', 2, '2024-12-22', 3300000, 'cash', 7),
('PAY003', 3, '2024-12-30', 66000000, 'bank_transfer', 7),
('PAY004', 4, '2024-12-16', 1760000, 'credit_card', 7),
('PAY005', 5, '2024-12-17', 660000, 'cash', 7);

-- =============================================
-- 20. INSERT WAREHOUSES
-- =============================================
INSERT INTO warehouses (warehouse_name, location, manager_id) VALUES
('Main Warehouse', 'Tầng hầm tòa nhà chính', 4),
('Kitchen Storage', 'Khu vực bếp', 10),
('Spa Storage', 'Khu vực spa', 9),
('Housekeeping Storage', 'Khu vực buồng phòng', 4);

-- =============================================
-- 21. INSERT ITEM CATEGORIES
-- =============================================
INSERT INTO item_categories (category_name, description) VALUES
('Food & Beverage', 'Thực phẩm và đồ uống'),
('Cleaning Supplies', 'Vật tư vệ sinh'),
('Spa Products', 'Sản phẩm spa'),
('Office Supplies', 'Vật tư văn phòng'),
('Maintenance Tools', 'Dụng cụ bảo trì'),
('Linens & Towels', 'Khăn trải giường và khăn tắm'),
('Electronics', 'Thiết bị điện tử');

-- =============================================
-- 22. INSERT ITEMS
-- =============================================
INSERT INTO items (item_code, item_name, category_id, description, unit, cost_price, selling_price, min_stock_level) VALUES
-- Food & Beverage
('F&B001', 'Coffee Beans', 1, 'Cà phê hạt cao cấp', 'kg', 150000, 200000, 10),
('F&B002', 'Tea Leaves', 1, 'Lá trà chất lượng cao', 'kg', 100000, 150000, 5),
('F&B003', 'Mineral Water', 1, 'Nước khoáng đóng chai', 'bottle', 5000, 10000, 100),
('F&B004', 'Wine Red', 1, 'Rượu vang đỏ nhập khẩu', 'bottle', 200000, 350000, 20),

-- Cleaning Supplies
('CLN001', 'Detergent', 2, 'Bột giặt công nghiệp', 'kg', 50000, 80000, 20),
('CLN002', 'Disinfectant', 2, 'Chất khử trùng', 'liter', 30000, 50000, 15),
('CLN003', 'Toilet Paper', 2, 'Giấy vệ sinh', 'roll', 20000, 35000, 50),
('CLN004', 'Trash Bags', 2, 'Túi rác', 'pack', 25000, 40000, 30),

-- Spa Products
('SPA001', 'Massage Oil', 3, 'Dầu massage cao cấp', 'bottle', 80000, 120000, 10),
('SPA002', 'Essential Oils', 3, 'Tinh dầu thiên nhiên', 'bottle', 120000, 180000, 8),
('SPA003', 'Face Mask', 3, 'Mặt nạ chăm sóc da', 'piece', 50000, 80000, 20),
('SPA004', 'Bath Salt', 3, 'Muối tắm thảo dược', 'kg', 60000, 100000, 5),

-- Office Supplies
('OFF001', 'A4 Paper', 4, 'Giấy A4 trắng', 'ream', 80000, 120000, 10),
('OFF002', 'Ballpoint Pen', 4, 'Bút bi', 'piece', 5000, 10000, 50),
('OFF003', 'Notebook', 4, 'Sổ ghi chép', 'piece', 30000, 50000, 20),
('OFF004', 'Stapler', 4, 'Dập ghim', 'piece', 50000, 80000, 5),

-- Maintenance Tools
('MNT001', 'Screwdriver Set', 5, 'Bộ tua vít', 'set', 150000, 200000, 2),
('MNT002', 'Wrench Set', 5, 'Bộ cờ lê', 'set', 200000, 250000, 2),
('MNT003', 'Drill Machine', 5, 'Máy khoan', 'piece', 800000, 1000000, 1),
('MNT004', 'Ladder', 5, 'Thang', 'piece', 300000, 400000, 2),

-- Linens & Towels
('LIN001', 'Bed Sheets', 6, 'Khăn trải giường', 'set', 200000, 300000, 20),
('LIN002', 'Bath Towels', 6, 'Khăn tắm', 'piece', 80000, 120000, 50),
('LIN003', 'Hand Towels', 6, 'Khăn tay', 'piece', 30000, 50000, 100),
('LIN004', 'Pillow Cases', 6, 'Vỏ gối', 'piece', 50000, 80000, 30),

-- Electronics
('ELE001', 'LED Bulb', 7, 'Bóng đèn LED', 'piece', 50000, 80000, 20),
('ELE002', 'Extension Cord', 7, 'Dây nối dài', 'piece', 80000, 120000, 10),
('ELE003', 'Power Strip', 7, 'Ổ cắm đa năng', 'piece', 100000, 150000, 5),
('ELE004', 'Remote Control', 7, 'Điều khiển từ xa', 'piece', 150000, 200000, 5);

-- =============================================
-- 23. INSERT INVENTORY
-- =============================================
INSERT INTO inventory (item_id, warehouse_id, quantity_on_hand, quantity_reserved) VALUES
-- Main Warehouse
(1, 1, 25, 0), (2, 1, 15, 0), (3, 1, 200, 0), (4, 1, 30, 0),
(5, 1, 40, 0), (6, 1, 25, 0), (7, 1, 80, 0), (8, 1, 50, 0),
(9, 1, 20, 0), (10, 1, 15, 0), (11, 1, 35, 0), (12, 1, 10, 0),
(13, 1, 20, 0), (14, 1, 80, 0), (15, 1, 40, 0), (16, 1, 10, 0),
(17, 1, 4, 0), (18, 1, 4, 0), (19, 1, 2, 0), (20, 1, 3, 0),
(21, 1, 30, 0), (22, 1, 80, 0), (23, 1, 150, 0), (24, 1, 50, 0),
(25, 1, 30, 0), (26, 1, 15, 0), (27, 1, 8, 0), (28, 1, 10, 0),

-- Kitchen Storage
(1, 2, 10, 0), (2, 2, 5, 0), (3, 2, 50, 0), (4, 2, 10, 0),

-- Spa Storage
(9, 3, 15, 0), (10, 3, 10, 0), (11, 3, 25, 0), (12, 3, 8, 0),

-- Housekeeping Storage
(5, 4, 20, 0), (6, 4, 15, 0), (7, 4, 40, 0), (8, 4, 25, 0),
(21, 4, 20, 0), (22, 4, 50, 0), (23, 4, 100, 0), (24, 4, 30, 0);

-- =============================================
-- 24. INSERT SYSTEM SETTINGS
-- =============================================
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('resort_name', 'Paradise Resort & Spa', 'string', 'Tên resort', TRUE),
('resort_address', '123 Beach Road, Nha Trang, Vietnam', 'string', 'Địa chỉ resort', TRUE),
('resort_phone', '+84 258 123 4567', 'string', 'Số điện thoại resort', TRUE),
('resort_email', 'info@paradiseresort.com', 'string', 'Email resort', TRUE),
('currency', 'VND', 'string', 'Đơn vị tiền tệ', TRUE),
('tax_rate', '10', 'number', 'Tỷ lệ thuế VAT (%)', FALSE),
('check_in_time', '14:00', 'string', 'Giờ check-in mặc định', TRUE),
('check_out_time', '12:00', 'string', 'Giờ check-out mặc định', TRUE),
('late_checkout_fee', '500000', 'number', 'Phí check-out muộn', FALSE),
('cancellation_hours', '24', 'number', 'Số giờ hủy phòng trước khi check-in', FALSE),
('max_advance_booking_days', '365', 'number', 'Số ngày đặt phòng trước tối đa', FALSE),
('loyalty_points_per_vnd', '1', 'number', 'Điểm thưởng cho mỗi VND', FALSE),
('vnd_per_loyalty_point', '1000', 'number', 'VND cho mỗi điểm thưởng', FALSE);

-- =============================================
-- 25. INSERT NOTIFICATIONS
-- =============================================
INSERT INTO notifications (title, message, type, target_role_id, created_by) VALUES
('Chào mừng đến với hệ thống', 'Chào mừng bạn đến với hệ thống quản lý resort!', 'info', 3, 1),
('Hướng dẫn sử dụng', 'Vui lòng đọc hướng dẫn sử dụng hệ thống trước khi bắt đầu.', 'info', 3, 1),
('Cập nhật hệ thống', 'Hệ thống đã được cập nhật với các tính năng mới.', 'info', NULL, 1);

-- =============================================
-- END OF SAMPLE DATA
-- =============================================

