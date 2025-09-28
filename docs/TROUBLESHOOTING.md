# Troubleshooting Guide

## SQL Server Connection Issues

### 1. Lỗi "Login failed for user 'sa'"

**Nguyên nhân**: SQL Server Authentication chưa được bật hoặc tài khoản sa bị vô hiệu hóa.

**Giải pháp**:
1. Mở SQL Server Management Studio (SSMS)
2. Kết nối với SQL Server bằng Windows Authentication
3. Right-click vào server name → Properties
4. Chọn Security → SQL Server and Windows Authentication mode
5. Restart SQL Server service
6. Đảm bảo tài khoản sa được enable:
   ```sql
   ALTER LOGIN sa ENABLE;
   ALTER LOGIN sa WITH PASSWORD = 'yourStrong(!)Password';
   ```

### 2. Lỗi "Cannot connect to server"

**Nguyên nhân**: SQL Server service chưa chạy hoặc firewall chặn.

**Giải pháp**:
1. Kiểm tra SQL Server service đang chạy:
   - Mở Services.msc
   - Tìm "SQL Server (MSSQLSERVER)" hoặc "SQL Server (SQLEXPRESS)"
   - Đảm bảo Status = Running

2. Kiểm tra port 1433:
   ```bash
   telnet localhost 1433
   ```

3. Mở Windows Firewall cho SQL Server:
   - Control Panel → System and Security → Windows Defender Firewall
   - Advanced settings → Inbound Rules → New Rule
   - Port → TCP → Specific local ports: 1433

### 3. Lỗi "sqlcmd is not recognized"

**Nguyên nhân**: SQL Server Command Line Utilities chưa được cài đặt.

**Giải pháp**:
1. Download SQL Server Command Line Utilities từ Microsoft
2. Hoặc cài đặt SQL Server Management Studio (bao gồm sqlcmd)
3. Thêm đường dẫn vào PATH environment variable:
   ```
   C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn
   ```

## Database Migration Issues

### 1. Lỗi "Invalid object name"

**Nguyên nhân**: Bảng chưa được tạo hoặc tên bảng sai.

**Giải pháp**:
1. Kiểm tra file migration_fixed.sql có syntax đúng
2. Chạy lại migration:
   ```bash
   npm run db:reset
   ```

### 2. Lỗi "Foreign key constraint"

**Nguyên nhân**: Thứ tự tạo bảng không đúng hoặc dữ liệu tham chiếu không tồn tại.

**Giải pháp**:
1. Xóa database và tạo lại:
   ```sql
   DROP DATABASE ResortManagement;
   ```
2. Chạy lại migration script

### 3. Lỗi "Cannot insert duplicate key"

**Nguyên nhân**: Dữ liệu mẫu đã tồn tại.

**Giải pháp**:
- Script đã có kiểm tra `IF NOT EXISTS`, nên lỗi này ít xảy ra
- Nếu vẫn gặp, chạy:
  ```bash
  npm run db:reset
  ```

## Node.js Application Issues

### 1. Lỗi "Cannot find module 'mssql'"

**Nguyên nhân**: Dependencies chưa được cài đặt.

**Giải pháp**:
```bash
npm install
```

### 2. Lỗi "ECONNREFUSED"

**Nguyên nhân**: Không thể kết nối đến SQL Server.

**Giải pháp**:
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra thông tin kết nối trong .env file
3. Test connection:
   ```bash
   sqlcmd -S localhost -U sa -P yourStrong(!)Password -Q "SELECT 1"
   ```

### 3. Lỗi "Invalid token"

**Nguyên nhân**: JWT token không hợp lệ hoặc đã hết hạn.

**Giải pháp**:
1. Kiểm tra JWT_SECRET trong .env file
2. Đảm bảo token được gửi đúng format:
   ```
   Authorization: Bearer <token>
   ```

## API Testing Issues

### 1. Lỗi 401 Unauthorized

**Nguyên nhân**: Chưa có token hoặc token không hợp lệ.

**Giải pháp**:
1. Đăng nhập để lấy token
2. Thêm token vào header:
   ```
   Authorization: Bearer <your_token>
   ```

### 2. Lỗi 403 Forbidden

**Nguyên nhân**: Không có quyền truy cập endpoint.

**Giải pháp**:
1. Kiểm tra role của user
2. Đảm bảo user có quyền cần thiết

### 3. Lỗi 500 Internal Server Error

**Nguyên nhân**: Lỗi server hoặc database.

**Giải pháp**:
1. Kiểm tra server logs
2. Kiểm tra database connection
3. Kiểm tra syntax SQL trong models

## Performance Issues

### 1. API response chậm

**Nguyên nhân**: Database query không tối ưu.

**Giải pháp**:
1. Thêm indexes cho các cột thường query
2. Sử dụng pagination cho large datasets
3. Kiểm tra execution plan của queries

### 2. Memory usage cao

**Nguyên nhân**: Connection pool không được quản lý tốt.

**Giải pháp**:
1. Kiểm tra connection pool settings trong config/db.js
2. Đảm bảo connections được đóng đúng cách

## Common Solutions

### Reset toàn bộ hệ thống
```bash
# 1. Stop application
Ctrl+C

# 2. Reset database
npm run db:reset

# 3. Reinstall dependencies
rm -rf node_modules
npm install

# 4. Start application
npm run dev
```

### Kiểm tra logs
```bash
# Xem logs của application
npm run dev

# Xem logs của SQL Server
# Mở SQL Server Management Studio → Management → SQL Server Logs
```

### Test database connection
```bash
# Test với sqlcmd
sqlcmd -S localhost -U sa -P yourStrong(!)Password -Q "SELECT @@VERSION"

# Test với Node.js
node -e "
const { testConnection } = require('./src/config/db');
testConnection().then(result => console.log('Connection:', result));
"
```

## Getting Help

Nếu vẫn gặp vấn đề:

1. **Kiểm tra logs**: Xem console output và error messages
2. **Kiểm tra SQL Server**: Đảm bảo service đang chạy và có thể kết nối
3. **Kiểm tra network**: Test connection từ máy khác
4. **Kiểm tra permissions**: Đảm bảo user có quyền tạo database và tables
5. **Kiểm tra version**: Đảm bảo SQL Server version tương thích

## Useful Commands

```bash
# Kiểm tra SQL Server version
sqlcmd -S localhost -U sa -P yourStrong(!)Password -Q "SELECT @@VERSION"

# Kiểm tra databases
sqlcmd -S localhost -U sa -P yourStrong(!)Password -Q "SELECT name FROM sys.databases"

# Kiểm tra tables
sqlcmd -S localhost -U sa -P yourStrong(!)Password -d ResortManagement -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES"

# Test API health
curl http://localhost:3000/api/health

# Test database connection từ Node.js
node -e "require('./src/config/db').testConnection()"
```
