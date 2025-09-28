-- =============================================
-- RESORT MANAGEMENT SYSTEM DATABASE SCHEMA
-- =============================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS resort_management;
USE resort_management;

-- =============================================
-- 1. BẢNG QUẢN LÝ NGƯỜI DÙNG VÀ PHÂN QUYỀN
-- =============================================

-- Bảng vai trò
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng phòng ban
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng nhân viên
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    position VARCHAR(100),
    department_id INT,
    hire_date DATE,
    salary DECIMAL(12,2),
    status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- Bảng người dùng hệ thống
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    employee_id INT,
    role_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Bảng quyền hạn
CREATE TABLE permissions (
    permission_id INT PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    module VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng phân quyền chi tiết
CREATE TABLE role_permissions (
    role_id INT,
    permission_id INT,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id),
    FOREIGN KEY (granted_by) REFERENCES users(user_id)
);

-- =============================================
-- 2. BẢNG QUẢN LÝ KHÁCH HÀNG
-- =============================================

-- Bảng khách hàng
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    nationality VARCHAR(50),
    passport_number VARCHAR(50),
    id_card_number VARCHAR(50),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    customer_type ENUM('individual', 'corporate', 'vip') DEFAULT 'individual',
    loyalty_points INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng lịch sử khách hàng
CREATE TABLE customer_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    action_type ENUM('check_in', 'check_out', 'service_used', 'complaint', 'compliment'),
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- =============================================
-- 3. BẢNG QUẢN LÝ PHÒNG
-- =============================================

-- Bảng loại phòng
CREATE TABLE room_types (
    room_type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(12,2) NOT NULL,
    max_occupancy INT NOT NULL,
    amenities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng phòng
CREATE TABLE rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    room_type_id INT,
    floor_number INT,
    status ENUM('available', 'occupied', 'maintenance', 'cleaning', 'out_of_order') DEFAULT 'available',
    last_cleaned TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id)
);

-- Bảng giá phòng theo mùa
CREATE TABLE room_pricing (
    pricing_id INT PRIMARY KEY AUTO_INCREMENT,
    room_type_id INT,
    season_name VARCHAR(50),
    start_date DATE,
    end_date DATE,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id)
);

-- =============================================
-- 4. BẢNG QUẢN LÝ ĐẶT PHÒNG
-- =============================================

-- Bảng đặt phòng
CREATE TABLE reservations (
    reservation_id INT PRIMARY KEY AUTO_INCREMENT,
    reservation_code VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT,
    room_type_id INT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    adults INT DEFAULT 1,
    children INT DEFAULT 0,
    status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show') DEFAULT 'pending',
    total_amount DECIMAL(12,2),
    deposit_amount DECIMAL(12,2) DEFAULT 0,
    special_requests TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Bảng chi tiết phòng được gán
CREATE TABLE reservation_rooms (
    reservation_room_id INT PRIMARY KEY AUTO_INCREMENT,
    reservation_id INT,
    room_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

-- Bảng check-in/check-out
CREATE TABLE check_ins (
    check_in_id INT PRIMARY KEY AUTO_INCREMENT,
    reservation_id INT,
    room_id INT,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP NULL,
    actual_adults INT,
    actual_children INT,
    checked_in_by INT,
    checked_out_by INT,
    notes TEXT,
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (checked_in_by) REFERENCES users(user_id),
    FOREIGN KEY (checked_out_by) REFERENCES users(user_id)
);

-- =============================================
-- 5. BẢNG QUẢN LÝ DỊCH VỤ
-- =============================================

-- Bảng loại dịch vụ
CREATE TABLE service_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng dịch vụ
CREATE TABLE services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    service_code VARCHAR(20) NOT NULL UNIQUE,
    service_name VARCHAR(100) NOT NULL,
    category_id INT,
    description TEXT,
    unit_price DECIMAL(12,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'item',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(category_id)
);

-- Bảng đặt dịch vụ
CREATE TABLE service_bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT,
    service_id INT,
    booking_date DATE NOT NULL,
    service_date DATE NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(12,2),
    total_amount DECIMAL(12,2),
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    special_requests TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (service_id) REFERENCES services(service_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- =============================================
-- 6. BẢNG QUẢN LÝ HÓA ĐƠN VÀ THANH TOÁN
-- =============================================

-- Bảng hóa đơn
CREATE TABLE invoices (
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT,
    reservation_id INT,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    payment_method ENUM('cash', 'credit_card', 'bank_transfer', 'voucher', 'loyalty_points') NULL,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Bảng chi tiết hóa đơn
CREATE TABLE invoice_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT,
    item_type ENUM('room', 'service', 'product', 'other'),
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
);

-- Bảng thanh toán
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    payment_number VARCHAR(20) NOT NULL UNIQUE,
    invoice_id INT,
    payment_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('cash', 'credit_card', 'bank_transfer', 'voucher', 'loyalty_points'),
    reference_number VARCHAR(100),
    notes TEXT,
    processed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
    FOREIGN KEY (processed_by) REFERENCES users(user_id)
);

-- =============================================
-- 7. BẢNG QUẢN LÝ VẬT TƯ VÀ KHO
-- =============================================

-- Bảng kho
CREATE TABLE warehouses (
    warehouse_id INT PRIMARY KEY AUTO_INCREMENT,
    warehouse_name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

-- Bảng loại vật tư
CREATE TABLE item_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng vật tư
CREATE TABLE items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_code VARCHAR(20) NOT NULL UNIQUE,
    item_name VARCHAR(100) NOT NULL,
    category_id INT,
    description TEXT,
    unit VARCHAR(20) NOT NULL,
    cost_price DECIMAL(12,2),
    selling_price DECIMAL(12,2),
    min_stock_level INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES item_categories(category_id)
);

-- Bảng tồn kho
CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT,
    warehouse_id INT,
    quantity_on_hand INT DEFAULT 0,
    quantity_reserved INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    UNIQUE KEY unique_item_warehouse (item_id, warehouse_id)
);

-- Bảng phiếu xuất kho
CREATE TABLE stock_issues (
    issue_id INT PRIMARY KEY AUTO_INCREMENT,
    issue_number VARCHAR(20) NOT NULL UNIQUE,
    warehouse_id INT,
    department_id INT,
    issue_date DATE NOT NULL,
    purpose TEXT,
    status ENUM('pending', 'approved', 'issued', 'cancelled') DEFAULT 'pending',
    requested_by INT,
    approved_by INT,
    issued_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (requested_by) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id),
    FOREIGN KEY (issued_by) REFERENCES users(user_id)
);

-- Bảng chi tiết phiếu xuất kho
CREATE TABLE stock_issue_items (
    issue_item_id INT PRIMARY KEY AUTO_INCREMENT,
    issue_id INT,
    item_id INT,
    quantity_requested INT NOT NULL,
    quantity_approved INT DEFAULT 0,
    quantity_issued INT DEFAULT 0,
    unit_cost DECIMAL(12,2),
    total_cost DECIMAL(12,2),
    FOREIGN KEY (issue_id) REFERENCES stock_issues(issue_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

-- =============================================
-- 8. BẢNG QUẢN LÝ BÁO CÁO VÀ AUDIT
-- =============================================

-- Bảng log hoạt động
CREATE TABLE activity_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng báo cáo
CREATE TABLE reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    report_name VARCHAR(100) NOT NULL,
    report_type ENUM('financial', 'operational', 'inventory', 'customer', 'custom') NOT NULL,
    description TEXT,
    query_sql TEXT,
    parameters JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Bảng lịch sử chạy báo cáo
CREATE TABLE report_runs (
    run_id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT,
    run_by INT,
    run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parameters JSON,
    result_file_path VARCHAR(500),
    status ENUM('running', 'completed', 'failed') DEFAULT 'running',
    error_message TEXT,
    FOREIGN KEY (report_id) REFERENCES reports(report_id),
    FOREIGN KEY (run_by) REFERENCES users(user_id)
);

-- =============================================
-- 9. BẢNG QUẢN LÝ HỆ THỐNG
-- =============================================

-- Bảng cấu hình hệ thống
CREATE TABLE system_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
);

-- Bảng thông báo
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    target_user_id INT NULL,
    target_role_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_user_id) REFERENCES users(user_id),
    FOREIGN KEY (target_role_id) REFERENCES roles(role_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- =============================================
-- 10. INDEXES VÀ CONSTRAINTS
-- =============================================

-- Indexes cho performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- =============================================
-- 11. TRIGGERS
-- =============================================

-- Trigger cập nhật trạng thái phòng khi check-in
DELIMITER //
CREATE TRIGGER tr_checkin_room_status
AFTER INSERT ON check_ins
FOR EACH ROW
BEGIN
    UPDATE rooms 
    SET status = 'occupied' 
    WHERE room_id = NEW.room_id;
END//
DELIMITER ;

-- Trigger cập nhật trạng thái phòng khi check-out
DELIMITER //
CREATE TRIGGER tr_checkout_room_status
AFTER UPDATE ON check_ins
FOR EACH ROW
BEGIN
    IF NEW.check_out_time IS NOT NULL AND OLD.check_out_time IS NULL THEN
        UPDATE rooms 
        SET status = 'cleaning' 
        WHERE room_id = NEW.room_id;
    END IF;
END//
DELIMITER ;

-- Trigger cập nhật tồn kho khi xuất kho
DELIMITER //
CREATE TRIGGER tr_update_inventory_after_issue
AFTER UPDATE ON stock_issue_items
FOR EACH ROW
BEGIN
    IF NEW.quantity_issued > OLD.quantity_issued THEN
        UPDATE inventory 
        SET quantity_on_hand = quantity_on_hand - (NEW.quantity_issued - OLD.quantity_issued)
        WHERE item_id = NEW.item_id;
    END IF;
END//
DELIMITER ;

-- =============================================
-- 12. VIEWS
-- =============================================

-- View tổng hợp thông tin khách hàng
CREATE VIEW v_customer_summary AS
SELECT 
    c.customer_id,
    c.customer_code,
    CONCAT(c.first_name, ' ', c.last_name) AS full_name,
    c.email,
    c.phone,
    c.customer_type,
    c.loyalty_points,
    COUNT(r.reservation_id) AS total_reservations,
    COALESCE(SUM(i.total_amount), 0) AS total_spent
FROM customers c
LEFT JOIN reservations r ON c.customer_id = r.customer_id
LEFT JOIN invoices i ON r.reservation_id = i.reservation_id
GROUP BY c.customer_id;

-- View tình trạng phòng hiện tại
CREATE VIEW v_room_status AS
SELECT 
    r.room_id,
    r.room_number,
    rt.type_name,
    r.status,
    r.floor_number,
    ci.check_in_time,
    ci.check_out_time,
    c.customer_code,
    CONCAT(c.first_name, ' ', c.last_name) AS guest_name
FROM rooms r
LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
LEFT JOIN check_ins ci ON r.room_id = ci.room_id AND ci.check_out_time IS NULL
LEFT JOIN reservations res ON ci.reservation_id = res.reservation_id
LEFT JOIN customers c ON res.customer_id = c.customer_id;

-- View doanh thu theo ngày
CREATE VIEW v_daily_revenue AS
SELECT 
    DATE(i.invoice_date) AS revenue_date,
    COUNT(i.invoice_id) AS total_invoices,
    SUM(i.total_amount) AS total_revenue,
    SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END) AS paid_revenue,
    SUM(CASE WHEN i.status = 'overdue' THEN i.total_amount ELSE 0 END) AS overdue_revenue
FROM invoices i
GROUP BY DATE(i.invoice_date);

-- =============================================
-- END OF SCHEMA
-- =============================================
