-- =============================================
-- RESORT MANAGEMENT SYSTEM - SQL SERVER MIGRATION
-- =============================================

-- Tạo database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ResortManagement')
BEGIN
    CREATE DATABASE ResortManagement;
END
GO

USE ResortManagement;
GO

-- =============================================
-- 1. BẢNG QUẢN LÝ NGƯỜI DÙNG VÀ PHÂN QUYỀN
-- =============================================

-- Bảng vai trò
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type in (N'U'))
CREATE TABLE Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng phòng ban
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Departments' AND xtype='U')
CREATE TABLE Departments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    ManagerId INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng nhân viên
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Employees' AND xtype='U')
CREATE TABLE Employees (
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeCode NVARCHAR(20) NOT NULL UNIQUE,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) UNIQUE,
    Phone NVARCHAR(20),
    Address NVARCHAR(255),
    Position NVARCHAR(100),
    DepartmentId INT,
    HireDate DATE,
    Salary DECIMAL(12,2),
    Status NVARCHAR(20) DEFAULT 'active',
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (DepartmentId) REFERENCES Departments(DepartmentId)
);
GO

-- Bảng người dùng hệ thống
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    EmployeeId INT,
    RoleId INT,
    IsActive BIT DEFAULT 1,
    LastLogin DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);
GO

-- =============================================
-- 2. BẢNG QUẢN LÝ KHÁCH HÀNG
-- =============================================

-- Bảng khách hàng
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Customers' AND xtype='U')
CREATE TABLE Customers (
    CustomerId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerCode NVARCHAR(20) NOT NULL UNIQUE,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100),
    Phone NVARCHAR(20),
    Address NVARCHAR(255),
    Nationality NVARCHAR(50),
    PassportNumber NVARCHAR(50),
    IdCardNumber NVARCHAR(50),
    DateOfBirth DATE,
    Gender NVARCHAR(10),
    CustomerType NVARCHAR(20) DEFAULT 'individual',
    LoyaltyPoints INT DEFAULT 0,
    Notes NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- =============================================
-- 3. BẢNG QUẢN LÝ PHÒNG
-- =============================================

-- Bảng loại phòng
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RoomTypes' AND xtype='U')
CREATE TABLE RoomTypes (
    RoomTypeId INT IDENTITY(1,1) PRIMARY KEY,
    TypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    BasePrice DECIMAL(12,2) NOT NULL,
    MaxOccupancy INT NOT NULL,
    Amenities NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng phòng
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Rooms' AND xtype='U')
CREATE TABLE Rooms (
    RoomId INT IDENTITY(1,1) PRIMARY KEY,
    RoomNumber NVARCHAR(20) NOT NULL UNIQUE,
    RoomTypeId INT,
    FloorNumber INT,
    Status NVARCHAR(20) DEFAULT 'available',
    LastCleaned DATETIME2,
    Notes NVARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (RoomTypeId) REFERENCES RoomTypes(RoomTypeId)
);
GO

-- =============================================
-- 4. BẢNG QUẢN LÝ ĐẶT PHÒNG
-- =============================================

-- Bảng đặt phòng
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Bookings' AND xtype='U')
CREATE TABLE Bookings (
    BookingId INT IDENTITY(1,1) PRIMARY KEY,
    BookingCode NVARCHAR(20) NOT NULL UNIQUE,
    CustomerId INT,
    RoomId INT,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    Adults INT DEFAULT 1,
    Children INT DEFAULT 0,
    Status NVARCHAR(20) DEFAULT 'pending',
    TotalAmount DECIMAL(12,2),
    DepositAmount DECIMAL(12,2) DEFAULT 0,
    SpecialRequests NVARCHAR(500),
    CreatedBy INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
    FOREIGN KEY (RoomId) REFERENCES Rooms(RoomId),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId)
);
GO

-- Bảng check-in/check-out
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CheckIns' AND xtype='U')
CREATE TABLE CheckIns (
    CheckInId INT IDENTITY(1,1) PRIMARY KEY,
    BookingId INT,
    RoomId INT,
    CheckInTime DATETIME2 DEFAULT GETDATE(),
    CheckOutTime DATETIME2,
    ActualAdults INT,
    ActualChildren INT,
    CheckedInBy INT,
    CheckedOutBy INT,
    Notes NVARCHAR(255),
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    FOREIGN KEY (RoomId) REFERENCES Rooms(RoomId),
    FOREIGN KEY (CheckedInBy) REFERENCES Users(UserId),
    FOREIGN KEY (CheckedOutBy) REFERENCES Users(UserId)
);
GO

-- =============================================
-- 5. BẢNG QUẢN LÝ DỊCH VỤ
-- =============================================

-- Bảng loại dịch vụ
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ServiceCategories' AND xtype='U')
CREATE TABLE ServiceCategories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng dịch vụ
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Services' AND xtype='U')
CREATE TABLE Services (
    ServiceId INT IDENTITY(1,1) PRIMARY KEY,
    ServiceCode NVARCHAR(20) NOT NULL UNIQUE,
    ServiceName NVARCHAR(100) NOT NULL,
    CategoryId INT,
    Description NVARCHAR(255),
    UnitPrice DECIMAL(12,2) NOT NULL,
    Unit NVARCHAR(20) DEFAULT 'item',
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (CategoryId) REFERENCES ServiceCategories(CategoryId)
);
GO

-- Bảng đặt dịch vụ
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ServiceBookings' AND xtype='U')
CREATE TABLE ServiceBookings (
    ServiceBookingId INT IDENTITY(1,1) PRIMARY KEY,
    BookingCode NVARCHAR(20) NOT NULL UNIQUE,
    CustomerId INT,
    ServiceId INT,
    BookingDate DATE NOT NULL,
    ServiceDate DATE NOT NULL,
    Quantity INT DEFAULT 1,
    UnitPrice DECIMAL(12,2),
    TotalAmount DECIMAL(12,2),
    Status NVARCHAR(20) DEFAULT 'pending',
    SpecialRequests NVARCHAR(255),
    CreatedBy INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
    FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId)
);
GO

-- =============================================
-- 6. BẢNG QUẢN LÝ HÓA ĐƠN VÀ THANH TOÁN
-- =============================================

-- Bảng hóa đơn
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Invoices' AND xtype='U')
CREATE TABLE Invoices (
    InvoiceId INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceNumber NVARCHAR(20) NOT NULL UNIQUE,
    CustomerId INT,
    BookingId INT,
    InvoiceDate DATE NOT NULL,
    DueDate DATE,
    Subtotal DECIMAL(12,2) NOT NULL,
    TaxAmount DECIMAL(12,2) DEFAULT 0,
    DiscountAmount DECIMAL(12,2) DEFAULT 0,
    TotalAmount DECIMAL(12,2) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'draft',
    PaymentMethod NVARCHAR(20),
    Notes NVARCHAR(255),
    CreatedBy INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId)
);
GO

-- Bảng chi tiết hóa đơn
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='InvoiceItems' AND xtype='U')
CREATE TABLE InvoiceItems (
    ItemId INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceId INT,
    ItemType NVARCHAR(20),
    ItemName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(255),
    Quantity DECIMAL(10,2) DEFAULT 1,
    UnitPrice DECIMAL(12,2) NOT NULL,
    TotalPrice DECIMAL(12,2) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (InvoiceId) REFERENCES Invoices(InvoiceId)
);
GO

-- Bảng thanh toán
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Payments' AND xtype='U')
CREATE TABLE Payments (
    PaymentId INT IDENTITY(1,1) PRIMARY KEY,
    PaymentNumber NVARCHAR(20) NOT NULL UNIQUE,
    InvoiceId INT,
    PaymentDate DATE NOT NULL,
    Amount DECIMAL(12,2) NOT NULL,
    PaymentMethod NVARCHAR(20),
    ReferenceNumber NVARCHAR(100),
    Notes NVARCHAR(255),
    ProcessedBy INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (InvoiceId) REFERENCES Invoices(InvoiceId),
    FOREIGN KEY (ProcessedBy) REFERENCES Users(UserId)
);
GO

-- =============================================
-- 7. BẢNG QUẢN LÝ KHO
-- =============================================

-- Bảng kho
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Warehouses' AND xtype='U')
CREATE TABLE Warehouses (
    WarehouseId INT IDENTITY(1,1) PRIMARY KEY,
    WarehouseName NVARCHAR(100) NOT NULL,
    Location NVARCHAR(200),
    ManagerId INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (ManagerId) REFERENCES Employees(EmployeeId)
);
GO

-- Bảng vật tư
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Items' AND xtype='U')
CREATE TABLE Items (
    ItemId INT IDENTITY(1,1) PRIMARY KEY,
    ItemCode NVARCHAR(20) NOT NULL UNIQUE,
    ItemName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Unit NVARCHAR(20) NOT NULL,
    CostPrice DECIMAL(12,2),
    SellingPrice DECIMAL(12,2),
    MinStockLevel INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng tồn kho
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Inventory' AND xtype='U')
CREATE TABLE Inventory (
    InventoryId INT IDENTITY(1,1) PRIMARY KEY,
    ItemId INT,
    WarehouseId INT,
    QuantityOnHand INT DEFAULT 0,
    QuantityReserved INT DEFAULT 0,
    LastUpdated DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (ItemId) REFERENCES Items(ItemId),
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(WarehouseId),
    UNIQUE (ItemId, WarehouseId)
);
GO

-- Bảng phiếu xuất kho
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StockIssues' AND xtype='U')
CREATE TABLE StockIssues (
    IssueId INT IDENTITY(1,1) PRIMARY KEY,
    IssueNumber NVARCHAR(20) NOT NULL UNIQUE,
    WarehouseId INT,
    DepartmentId INT,
    IssueDate DATE NOT NULL,
    Purpose NVARCHAR(255),
    Status NVARCHAR(20) DEFAULT 'pending',
    RequestedBy INT,
    ApprovedBy INT,
    IssuedBy INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(WarehouseId),
    FOREIGN KEY (DepartmentId) REFERENCES Departments(DepartmentId),
    FOREIGN KEY (RequestedBy) REFERENCES Users(UserId),
    FOREIGN KEY (ApprovedBy) REFERENCES Users(UserId),
    FOREIGN KEY (IssuedBy) REFERENCES Users(UserId)
);
GO

-- =============================================
-- 8. BẢNG AUDIT LOG
-- =============================================

-- Bảng log hoạt động
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLogs' AND xtype='U')
CREATE TABLE AuditLogs (
    LogId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT,
    Action NVARCHAR(100) NOT NULL,
    TableName NVARCHAR(50),
    RecordId INT,
    OldValues NVARCHAR(MAX),
    NewValues NVARCHAR(MAX),
    IpAddress NVARCHAR(45),
    UserAgent NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
GO

-- =============================================
-- 9. INSERT SAMPLE DATA
-- =============================================

-- Insert Roles
IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'admin')
BEGIN
    INSERT INTO Roles (RoleName, Description) VALUES 
    ('admin', 'Quản trị viên hệ thống'),
    ('manager', 'Quản lý'),
    ('receptionist', 'Nhân viên lễ tân'),
    ('housekeeping', 'Nhân viên buồng phòng'),
    ('accountant', 'Kế toán'),
    ('cashier', 'Thu ngân'),
    ('sales', 'Nhân viên kinh doanh');
END
GO

-- Insert Departments
IF NOT EXISTS (SELECT * FROM Departments WHERE DepartmentName = 'Quản lý')
BEGIN
    INSERT INTO Departments (DepartmentName, Description) VALUES 
    ('Quản lý', 'Ban quản lý resort'),
    ('Lễ tân', 'Bộ phận lễ tân và đón tiếp khách'),
    ('Buồng phòng', 'Bộ phận buồng phòng và dọn dẹp'),
    ('Kế toán', 'Bộ phận kế toán và tài chính'),
    ('Thu ngân', 'Bộ phận thu ngân'),
    ('Kinh doanh', 'Bộ phận kinh doanh và bán hàng'),
    ('Spa', 'Bộ phận spa và massage'),
    ('Nhà hàng', 'Bộ phận nhà hàng và bar');
END
GO

-- Insert Room Types
IF NOT EXISTS (SELECT * FROM RoomTypes WHERE TypeName = 'Standard Room')
BEGIN
    INSERT INTO RoomTypes (TypeName, Description, BasePrice, MaxOccupancy, Amenities) VALUES 
    ('Standard Room', 'Phòng tiêu chuẩn với view biển', 1500000, 2, 'WiFi, TV, Mini bar, Balcony'),
    ('Deluxe Room', 'Phòng deluxe với view biển và bồn tắm', 2500000, 2, 'WiFi, TV, Mini bar, Balcony, Bathtub, Sea view'),
    ('Suite', 'Suite cao cấp với phòng khách riêng', 4000000, 4, 'WiFi, TV, Mini bar, Balcony, Bathtub, Sea view, Living room, Kitchenette'),
    ('Presidential Suite', 'Suite tổng thống với đầy đủ tiện nghi', 8000000, 6, 'WiFi, TV, Mini bar, Balcony, Bathtub, Sea view, Living room, Kitchen, Butler service'),
    ('Villa', 'Villa riêng biệt với hồ bơi', 12000000, 8, 'WiFi, TV, Mini bar, Private pool, Garden, Kitchen, Butler service, Private beach access');
END
GO

-- Insert Rooms
IF NOT EXISTS (SELECT * FROM Rooms WHERE RoomNumber = '101')
BEGIN
    INSERT INTO Rooms (RoomNumber, RoomTypeId, FloorNumber, Status) VALUES 
    ('101', 1, 1, 'available'), ('102', 1, 1, 'available'), ('103', 1, 1, 'occupied'), ('104', 1, 1, 'available'),
    ('201', 2, 2, 'available'), ('202', 2, 2, 'occupied'), ('203', 2, 2, 'available'), ('204', 2, 2, 'available'),
    ('301', 3, 3, 'available'), ('302', 3, 3, 'available'), ('303', 3, 3, 'available'), ('304', 3, 3, 'available'),
    ('401', 4, 4, 'available'), ('402', 4, 4, 'available'),
    ('V01', 5, 0, 'available'), ('V02', 5, 0, 'available');
END
GO

-- Insert Service Categories
IF NOT EXISTS (SELECT * FROM ServiceCategories WHERE CategoryName = 'Spa & Wellness')
BEGIN
    INSERT INTO ServiceCategories (CategoryName, Description) VALUES 
    ('Spa & Wellness', 'Dịch vụ spa và chăm sóc sức khỏe'),
    ('Restaurant & Bar', 'Dịch vụ nhà hàng và bar'),
    ('Recreation', 'Dịch vụ giải trí và thể thao'),
    ('Transportation', 'Dịch vụ vận chuyển'),
    ('Business Services', 'Dịch vụ kinh doanh');
END
GO

-- Insert Services
IF NOT EXISTS (SELECT * FROM Services WHERE ServiceCode = 'SPA001')
BEGIN
    INSERT INTO Services (ServiceCode, ServiceName, CategoryId, Description, UnitPrice, Unit) VALUES 
    ('SPA001', 'Massage Thái', 1, 'Massage Thái truyền thống 60 phút', 800000, 'session'),
    ('SPA002', 'Massage Đá Nóng', 1, 'Massage với đá nóng 90 phút', 1200000, 'session'),
    ('RES001', 'Breakfast Buffet', 2, 'Buffet sáng cho 1 người', 200000, 'person'),
    ('RES002', 'Lunch Set Menu', 2, 'Set menu trưa cho 1 người', 350000, 'person'),
    ('REC001', 'Snorkeling Tour', 3, 'Tour lặn ống thở 3 giờ', 400000, 'person'),
    ('TRA001', 'Airport Transfer', 4, 'Đưa đón sân bay', 500000, 'trip');
END
GO

-- Insert Sample Customers
IF NOT EXISTS (SELECT * FROM Customers WHERE CustomerCode = 'CUST001')
BEGIN
    INSERT INTO Customers (CustomerCode, FirstName, LastName, Email, Phone, Nationality, CustomerType) VALUES 
    ('CUST001', 'John', 'Smith', 'john.smith@email.com', '+1234567890', 'American', 'individual'),
    ('CUST002', 'Maria', 'Garcia', 'maria.garcia@email.com', '+1234567891', 'Spanish', 'individual'),
    ('CUST003', 'Nguyễn', 'Văn Nam', 'nam.nguyen@email.com', '0901234567', 'Vietnamese', 'individual');
END
GO

PRINT 'Database migration completed successfully!';
GO
