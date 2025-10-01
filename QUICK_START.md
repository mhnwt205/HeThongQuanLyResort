# 🚀 Hướng Dẫn Chạy Nhanh

## Lần Đầu Chạy Project

```bash
# 1. Cài đặt dependencies
npm install

# 2. Setup tự động
npm run setup

# 3. Chạy server
npm start
```

## Lần Sau Chạy Project

```bash
# Chỉ cần chạy server
npm start
```

## Truy Cập Ứng Dụng

- **Trang chủ**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin
- **API docs**: http://localhost:3000/api/docs

## Cấu Hình Database

Project đã được cấu hình sẵn với:
- **Server**: localhost:1433
- **Database**: ResortManagement
- **User**: testuser
- **Password**: 123456
- **Auth Mode**: SQL Authentication

## Lưu Ý

- Đảm bảo SQL Server đang chạy
- Database `ResortManagement` phải tồn tại
- Nếu cần thay đổi cấu hình, sửa file `.env`

## Troubleshooting

### Lỗi kết nối database
```bash
# Kiểm tra SQL Server có chạy không
sqlcmd -S localhost -U testuser -P 123456 -Q "SELECT @@VERSION"

# Nếu lỗi, tạo lại database
npm run db:setup
```

### Lỗi port đã được sử dụng
```bash
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process (thay PID bằng số thực tế)
taskkill /PID <PID> /F
```

### Reset toàn bộ
```bash
# Reset database
npm run db:reset

# Chạy lại
npm start
```
