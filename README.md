# Hệ Thống Quản Lý Resort

Hệ thống quản lý resort toàn diện với SQL Server, MVC architecture và RESTful APIs. Đầy đủ tính năng từ đặt phòng, quản lý dịch vụ đến kế toán và báo cáo.

## 🏨 Tính Năng Chính

### 1. Quản Lý Khách Hàng
- Đăng ký và quản lý thông tin khách hàng
- Phân loại khách hàng (cá nhân, doanh nghiệp, VIP)
- Hệ thống điểm thưởng loyalty
- Lịch sử khách hàng

### 2. Quản Lý Phòng
- Quản lý các loại phòng (Standard, Deluxe, Suite, Presidential, Villa)
- Theo dõi trạng thái phòng (available, occupied, maintenance, cleaning)
- Giá phòng theo mùa
- Gán phòng tự động

### 3. Quản Lý Đặt Phòng
- Đặt phòng trực tuyến
- Check-in/Check-out
- Quản lý đặt phòng nhóm
- Hủy đặt phòng

### 4. Quản Lý Dịch Vụ
- Spa & Wellness (Massage, Facial, Body Scrub)
- Restaurant & Bar (Buffet, Set Menu, Room Service)
- Recreation (Snorkeling, Kayaking, Tennis, Gym)
- Transportation (Airport Transfer, City Tour, Car Rental)
- Business Services (Meeting Room, Business Center)
- Laundry & Cleaning
- Concierge Services

### 5. Quản Lý Tài Chính
- Tạo và quản lý hóa đơn
- Xử lý thanh toán (Cash, Credit Card, Bank Transfer)
- Theo dõi công nợ
- Báo cáo doanh thu

### 6. Quản Lý Kho
- Quản lý vật tư và tồn kho
- Phiếu xuất kho
- Theo dõi mức tồn kho tối thiểu
- Báo cáo tồn kho

### 7. Quản Lý Nhân Viên
- Quản lý thông tin nhân viên
- Phân quyền theo vai trò
- Theo dõi hoạt động
- Quản lý phòng ban

### 8. Báo Cáo & Thống Kê
- Báo cáo doanh thu
- Báo cáo tồn kho
- Báo cáo khách hàng
- Báo cáo hoạt động

## 🛠️ Công Nghệ Sử Dụng

- **Backend**: Node.js, Express.js
- **Database**: SQL Server
- **Architecture**: MVC Pattern
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **File Upload**: Multer
- **Email**: Nodemailer
- **Logging**: Winston
- **View Engine**: EJS
- **Session**: Express Session

## 📋 Yêu Cầu Hệ Thống

- Node.js >= 16.0.0
- SQL Server >= 2019
- npm >= 8.0.0

## 🚀 Cài Đặt

### 1. Clone Repository
```bash
git clone <repository-url>
cd ResortManagement
```

### 2. Cài Đặt Dependencies
```bash
npm install
```

### 3. Cấu Hình SQL Server
```bash
# Tạo file .env từ template
cp env.example .env

# Chỉnh sửa file .env với thông tin SQL Server của bạn
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=yourStrong(!)Password
DB_NAME=ResortManagement
DB_PORT=1433
```

### 4. Thiết Lập SQL Server

#### Cách 1: Sử dụng PowerShell Script (Khuyến nghị)
```powershell
# Chạy script PowerShell để setup database
.\scripts\setup-database.ps1

# Hoặc với tham số tùy chỉnh
.\scripts\setup-database.ps1 -Server "localhost" -Username "sa" -Password "yourPassword"
```

#### Cách 2: Sử dụng npm scripts
```bash
# Tạo database và import schema
npm run db:setup

# Hoặc reset toàn bộ database
npm run db:reset
```

#### Cách 3: Chạy thủ công
```bash
# Tạo database
sqlcmd -S localhost -U sa -P yourStrong(!)Password -Q "CREATE DATABASE ResortManagement"

# Chạy migration
sqlcmd -S localhost -U sa -P yourStrong(!)Password -d ResortManagement -i database/migration_fixed.sql
```

**Lưu ý**: 
- Đảm bảo SQL Server đang chạy và có thể kết nối được
- Script sẽ tự động tạo database `ResortManagement` nếu chưa tồn tại
- Nếu gặp lỗi, hãy kiểm tra SQL Server Authentication đã được bật

### 5. Chạy Ứng Dụng
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📊 Cấu Trúc Database

### Các Bảng Chính

1. **Quản Lý Người Dùng**
   - `roles` - Vai trò
   - `departments` - Phòng ban
   - `employees` - Nhân viên
   - `users` - Người dùng hệ thống
   - `permissions` - Quyền hạn
   - `role_permissions` - Phân quyền

2. **Quản Lý Khách Hàng**
   - `customers` - Khách hàng
   - `customer_history` - Lịch sử khách hàng

3. **Quản Lý Phòng**
   - `room_types` - Loại phòng
   - `rooms` - Phòng
   - `room_pricing` - Giá phòng theo mùa

4. **Quản Lý Đặt Phòng**
   - `reservations` - Đặt phòng
   - `reservation_rooms` - Chi tiết phòng được gán
   - `check_ins` - Check-in/Check-out

5. **Quản Lý Dịch Vụ**
   - `service_categories` - Loại dịch vụ
   - `services` - Dịch vụ
   - `service_bookings` - Đặt dịch vụ

6. **Quản Lý Tài Chính**
   - `invoices` - Hóa đơn
   - `invoice_items` - Chi tiết hóa đơn
   - `payments` - Thanh toán

7. **Quản Lý Kho**
   - `warehouses` - Kho
   - `item_categories` - Loại vật tư
   - `items` - Vật tư
   - `inventory` - Tồn kho
   - `stock_issues` - Phiếu xuất kho
   - `stock_issue_items` - Chi tiết xuất kho

8. **Báo Cáo & Audit**
   - `activity_logs` - Log hoạt động
   - `reports` - Báo cáo
   - `report_runs` - Lịch sử chạy báo cáo

9. **Hệ Thống**
   - `system_settings` - Cấu hình hệ thống
   - `notifications` - Thông báo

## 🔐 Phân Quyền

### Các Vai Trò Chính

1. **Admin** - Quản trị viên hệ thống
   - Toàn quyền truy cập
   - Quản lý người dùng và vai trò
   - Cấu hình hệ thống

2. **Manager** - Quản lý
   - Xem tất cả báo cáo
   - Quản lý nhân viên
   - Phê duyệt các giao dịch lớn

3. **Receptionist** - Nhân viên lễ tân
   - Quản lý khách hàng
   - Đặt phòng và check-in/out
   - Tạo hóa đơn

4. **Housekeeping** - Nhân viên buồng phòng
   - Quản lý trạng thái phòng
   - Cập nhật tình trạng dọn dẹp

5. **Accountant** - Kế toán
   - Quản lý tài chính
   - Tạo báo cáo
   - Xử lý thanh toán

6. **Cashier** - Thu ngân
   - Xử lý thanh toán
   - Tạo hóa đơn

7. **Sales** - Nhân viên kinh doanh
   - Quản lý khách hàng
   - Đặt phòng và dịch vụ

## 📈 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Thông tin profile

### Customers
- `GET /api/customers` - Danh sách khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `GET /api/customers/:id` - Chi tiết khách hàng
- `PUT /api/customers/:id` - Cập nhật khách hàng
- `DELETE /api/customers/:id` - Xóa khách hàng

### Reservations
- `GET /api/reservations` - Danh sách đặt phòng
- `POST /api/reservations` - Tạo đặt phòng mới
- `GET /api/reservations/:id` - Chi tiết đặt phòng
- `PUT /api/reservations/:id` - Cập nhật đặt phòng
- `POST /api/reservations/:id/checkin` - Check-in
- `POST /api/reservations/:id/checkout` - Check-out

### Rooms
- `GET /api/rooms` - Danh sách phòng
- `GET /api/rooms/available` - Phòng trống
- `PUT /api/rooms/:id/status` - Cập nhật trạng thái phòng

### Services
- `GET /api/services` - Danh sách dịch vụ
- `POST /api/services` - Tạo dịch vụ mới
- `GET /api/services/:id` - Chi tiết dịch vụ
- `PUT /api/services/:id` - Cập nhật dịch vụ

### Invoices
- `GET /api/invoices` - Danh sách hóa đơn
- `POST /api/invoices` - Tạo hóa đơn mới
- `GET /api/invoices/:id` - Chi tiết hóa đơn
- `POST /api/invoices/:id/payment` - Thanh toán

### Reports
- `GET /api/reports/revenue` - Báo cáo doanh thu
- `GET /api/reports/occupancy` - Báo cáo tỷ lệ lấp đầy
- `GET /api/reports/customers` - Báo cáo khách hàng

## 🔧 Scripts

```bash
# Chạy development server
npm run dev

# Chạy production server
npm start

# Thiết lập database
npm run db:setup

# Reset database
npm run db:reset

# Chạy tests
npm test
```

## 📝 Ghi Chú

- Tất cả mật khẩu được hash bằng bcrypt
- JWT token có thời hạn 24 giờ
- Rate limiting: 100 requests/15 phút
- File upload tối đa 10MB
- Logs được lưu trong thư mục `./logs`


