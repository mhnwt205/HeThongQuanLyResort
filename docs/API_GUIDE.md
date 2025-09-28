# Resort Management API Guide

## Tổng quan

Resort Management API cung cấp các endpoint RESTful để quản lý resort, bao gồm đặt phòng, thanh toán, quản lý khách hàng và báo cáo.

## Base URL

```
http://localhost:3000/api
```

## Authentication

API sử dụng JWT Bearer Token để xác thực. Thêm header sau vào mọi request:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

Tất cả API responses đều có format chuẩn:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Endpoints

### 1. Health Check

**GET** `/health`

Kiểm tra trạng thái API.

**Response:**
```json
{
  "success": true,
  "message": "Resort Management API is running",
  "timestamp": "2024-12-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. API Documentation

**GET** `/docs`

Lấy thông tin tài liệu API.

---

## Booking Endpoints

### Lấy tất cả đặt phòng

**GET** `/bookings`

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng mỗi trang (default: 10)
- `status` (optional): Lọc theo trạng thái

**Example:**
```bash
GET /api/bookings?page=1&limit=10&status=confirmed
```

### Lấy đặt phòng theo ID

**GET** `/bookings/:id`

**Example:**
```bash
GET /api/bookings/1
```

### Tạo đặt phòng mới

**POST** `/bookings`

**Request Body:**
```json
{
  "customerId": 1,
  "roomId": 1,
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-22",
  "adults": 2,
  "children": 0,
  "specialRequests": "Late check-in after 10 PM"
}
```

### Cập nhật đặt phòng

**PUT** `/bookings/:id`

**Request Body:**
```json
{
  "checkInDate": "2024-12-21",
  "checkOutDate": "2024-12-23",
  "adults": 2,
  "children": 1,
  "specialRequests": "Updated request"
}
```

### Hủy đặt phòng

**DELETE** `/bookings/:id`

### Check-in

**POST** `/bookings/:id/checkin`

**Request Body:**
```json
{
  "actualAdults": 2,
  "actualChildren": 0
}
```

### Check-out

**POST** `/bookings/:id/checkout`

### Lấy phòng trống

**GET** `/bookings/available-rooms`

**Query Parameters:**
- `checkInDate`: Ngày check-in (required)
- `checkOutDate`: Ngày check-out (required)
- `roomTypeId`: ID loại phòng (optional)

**Example:**
```bash
GET /api/bookings/available-rooms?checkInDate=2024-12-20&checkOutDate=2024-12-22
```

### Lấy đặt phòng theo ngày

**GET** `/bookings/by-date/:date`

**Example:**
```bash
GET /api/bookings/by-date/2024-12-20
```

---

## Payment Endpoints

### Lấy tất cả hóa đơn

**GET** `/payments/invoices`

**Query Parameters:**
- `page` (optional): Số trang
- `limit` (optional): Số lượng mỗi trang
- `status` (optional): Lọc theo trạng thái

### Lấy hóa đơn theo ID

**GET** `/payments/invoices/:id`

### Tạo hóa đơn mới

**POST** `/payments/invoices`

**Request Body:**
```json
{
  "customerId": 1,
  "bookingId": 1,
  "invoiceDate": "2024-12-20",
  "dueDate": "2024-12-20",
  "subtotal": 3000000,
  "taxAmount": 300000,
  "discountAmount": 0,
  "totalAmount": 3300000,
  "notes": "Room accommodation for 2 nights"
}
```

### Cập nhật hóa đơn

**PUT** `/payments/invoices/:id`

### Thêm chi tiết hóa đơn

**POST** `/payments/invoices/:id/items`

**Request Body:**
```json
{
  "itemType": "service",
  "itemName": "Massage Thái",
  "description": "Thai massage 60 minutes",
  "quantity": 1,
  "unitPrice": 800000,
  "totalPrice": 800000
}
```

### Tạo thanh toán

**POST** `/payments`

**Request Body:**
```json
{
  "invoiceId": 1,
  "paymentDate": "2024-12-20",
  "amount": 3300000,
  "paymentMethod": "credit_card",
  "referenceNumber": "TXN123456789",
  "notes": "Payment via credit card"
}
```

### Lấy lịch sử thanh toán

**GET** `/payments/invoices/:id/payments`

### Lấy báo cáo doanh thu

**GET** `/payments/revenue-report`

**Query Parameters:**
- `startDate`: Ngày bắt đầu (required)
- `endDate`: Ngày kết thúc (required)

**Example:**
```bash
GET /api/payments/revenue-report?startDate=2024-12-01&endDate=2024-12-31
```

### Lấy hóa đơn theo khách hàng

**GET** `/payments/customers/:id/invoices`

### In hóa đơn

**GET** `/payments/invoices/:id/print`

---

## Status Codes

- `200` - OK: Request thành công
- `201` - Created: Tạo mới thành công
- `400` - Bad Request: Dữ liệu request không hợp lệ
- `401` - Unauthorized: Chưa xác thực
- `403` - Forbidden: Không có quyền truy cập
- `404` - Not Found: Không tìm thấy resource
- `500` - Internal Server Error: Lỗi server

## Error Handling

API trả về lỗi với format chuẩn:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

## Rate Limiting

API có rate limiting: 100 requests per 15 minutes per IP.

## Testing với Postman

1. Import file `docs/postman_collection.json` vào Postman
2. Set biến `base_url` = `http://localhost:3000/api`
3. Set biến `jwt_token` với token JWT hợp lệ
4. Chạy các request để test API

## Example Usage

### 1. Tạo đặt phòng hoàn chỉnh

```bash
# 1. Lấy phòng trống
GET /api/bookings/available-rooms?checkInDate=2024-12-20&checkOutDate=2024-12-22

# 2. Tạo đặt phòng
POST /api/bookings
{
  "customerId": 1,
  "roomId": 1,
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-22",
  "adults": 2,
  "children": 0
}

# 3. Check-in
POST /api/bookings/1/checkin
{
  "actualAdults": 2,
  "actualChildren": 0
}

# 4. Check-out (tự động tạo hóa đơn)
POST /api/bookings/1/checkout

# 5. Thanh toán
POST /api/payments
{
  "invoiceId": 1,
  "amount": 3300000,
  "paymentMethod": "credit_card"
}
```

### 2. Xem báo cáo doanh thu

```bash
GET /api/payments/revenue-report?startDate=2024-12-01&endDate=2024-12-31
```

## Support

Nếu có vấn đề với API, vui lòng kiểm tra:
1. Database connection
2. JWT token validity
3. Request format
4. Server logs

