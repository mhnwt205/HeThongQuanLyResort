const { query } = require('../config/db');

/**
 * Booking Model - Quản lý đặt phòng
 */
class Booking {
    /**
     * Lấy tất cả đặt phòng
     * @param {number} page - Trang hiện tại
     * @param {number} limit - Số lượng mỗi trang
     * @returns {Promise<Array>} Danh sách đặt phòng
     */
    static async getAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const sql = `
            SELECT b.*, c.FirstName, c.LastName, c.Email, c.Phone,
                   r.RoomNumber, rt.TypeName, rt.BasePrice
            FROM Bookings b
            LEFT JOIN Customers c ON b.CustomerId = c.CustomerId
            LEFT JOIN Rooms r ON b.RoomId = r.RoomId
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            ORDER BY b.CreatedAt DESC
            OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY
        `;
        return await query(sql, [offset, limit]);
    }

    /**
     * Lấy đặt phòng theo ID
     * @param {number} id - ID đặt phòng
     * @returns {Promise<Object>} Thông tin đặt phòng
     */
    static async getById(id) {
        const sql = `
            SELECT b.*, c.FirstName, c.LastName, c.Email, c.Phone, c.CustomerCode,
                   r.RoomNumber, rt.TypeName, rt.BasePrice, rt.MaxOccupancy, rt.Amenities,
                   ci.CheckInTime, ci.CheckOutTime, ci.ActualAdults, ci.ActualChildren
            FROM Bookings b
            LEFT JOIN Customers c ON b.CustomerId = c.CustomerId
            LEFT JOIN Rooms r ON b.RoomId = r.RoomId
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            LEFT JOIN CheckIns ci ON b.BookingId = ci.BookingId
            WHERE b.BookingId = @p1
        `;
        const result = await query(sql, [id]);
        return result[0] || null;
    }

    /**
     * Lấy đặt phòng theo mã đặt phòng
     * @param {string} bookingCode - Mã đặt phòng
     * @returns {Promise<Object>} Thông tin đặt phòng
     */
    static async getByCode(bookingCode) {
        const sql = `
            SELECT b.*, c.FirstName, c.LastName, c.Email, c.Phone, c.CustomerCode,
                   r.RoomNumber, rt.TypeName, rt.BasePrice, rt.MaxOccupancy, rt.Amenities
            FROM Bookings b
            LEFT JOIN Customers c ON b.CustomerId = c.CustomerId
            LEFT JOIN Rooms r ON b.RoomId = r.RoomId
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            WHERE b.BookingCode = @p1
        `;
        const result = await query(sql, [bookingCode]);
        return result[0] || null;
    }

    /**
     * Tạo đặt phòng mới
     * @param {Object} bookingData - Dữ liệu đặt phòng
     * @returns {Promise<Object>} Đặt phòng vừa tạo
     */
    static async create(bookingData) {
        const {
            bookingCode, customerId, roomId, checkInDate, checkOutDate,
            adults, children, status, totalAmount, depositAmount, specialRequests, createdBy, paymentMethod
        } = bookingData;

        const sql = `
            INSERT INTO Bookings (
                BookingCode, CustomerId, RoomId, CheckInDate, CheckOutDate,
                Adults, Children, Status, TotalAmount, DepositAmount, SpecialRequests, CreatedBy, PaymentMethod
            ) VALUES (
                @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13
            );
            SELECT SCOPE_IDENTITY() as BookingId;
        `;

        const result = await query(sql, [
            bookingCode, customerId, roomId, checkInDate, checkOutDate,
            adults, children, status, totalAmount, depositAmount, specialRequests, createdBy, paymentMethod || 'cash'
        ]);

        return await this.getById(result[0].BookingId);
    }

    /**
     * Cập nhật đặt phòng
     * @param {number} id - ID đặt phòng
     * @param {Object} bookingData - Dữ liệu cập nhật
     * @returns {Promise<Object>} Đặt phòng đã cập nhật
     */
    static async update(id, bookingData) {
        const {
            roomId, checkInDate, checkOutDate, adults, children,
            status, totalAmount, depositAmount, specialRequests
        } = bookingData;

        const sql = `
            UPDATE Bookings SET
                RoomId = @p2, CheckInDate = @p3, CheckOutDate = @p4,
                Adults = @p5, Children = @p6, Status = @p7,
                TotalAmount = @p8, DepositAmount = @p9, SpecialRequests = @p10,
                UpdatedAt = GETDATE()
            WHERE BookingId = @p1
        `;

        await query(sql, [
            id, roomId, checkInDate, checkOutDate, adults, children,
            status, totalAmount, depositAmount, specialRequests
        ]);

        return await this.getById(id);
    }

    /**
     * Hủy đặt phòng
     * @param {number} id - ID đặt phòng
     * @returns {Promise<Object>} Đặt phòng đã hủy
     */
    static async cancel(id) {
        const sql = `
            UPDATE Bookings SET Status = 'cancelled', UpdatedAt = GETDATE()
            WHERE BookingId = @p1
        `;

        await query(sql, [id]);
        return await this.getById(id);
    }

    /**
     * Check-in
     * @param {number} bookingId - ID đặt phòng
     * @param {number} roomId - ID phòng
     * @param {number} actualAdults - Số người lớn thực tế
     * @param {number} actualChildren - Số trẻ em thực tế
     * @param {number} checkedInBy - ID người check-in
     * @returns {Promise<Object>} Thông tin check-in
     */
    static async checkIn(bookingId, roomId, actualAdults, actualChildren, checkedInBy) {
        // Cập nhật trạng thái đặt phòng
        await query(
            'UPDATE Bookings SET Status = @p2, UpdatedAt = GETDATE() WHERE BookingId = @p1',
            [bookingId, 'checked_in']
        );

        // Cập nhật trạng thái phòng
        await query(
            'UPDATE Rooms SET Status = @p2, UpdatedAt = GETDATE() WHERE RoomId = @p1',
            [roomId, 'occupied']
        );

        // Tạo check-in record
        const sql = `
            INSERT INTO CheckIns (BookingId, RoomId, ActualAdults, ActualChildren, CheckedInBy)
            VALUES (@p1, @p2, @p3, @p4, @p5);
            SELECT SCOPE_IDENTITY() as CheckInId;
        `;

        const result = await query(sql, [bookingId, roomId, actualAdults, actualChildren, checkedInBy]);
        return result[0];
    }

    /**
     * Check-out
     * @param {number} bookingId - ID đặt phòng
     * @param {number} roomId - ID phòng
     * @param {number} checkedOutBy - ID người check-out
     * @returns {Promise<Object>} Thông tin check-out
     */
    static async checkOut(bookingId, roomId, checkedOutBy) {
        // Cập nhật trạng thái đặt phòng
        await query(
            'UPDATE Bookings SET Status = @p2, UpdatedAt = GETDATE() WHERE BookingId = @p1',
            [bookingId, 'checked_out']
        );

        // Cập nhật trạng thái phòng
        await query(
            'UPDATE Rooms SET Status = @p2, UpdatedAt = GETDATE() WHERE RoomId = @p1',
            [roomId, 'cleaning']
        );

        // Cập nhật check-out time
        const sql = `
            UPDATE CheckIns SET CheckOutTime = GETDATE(), CheckedOutBy = @p2
            WHERE BookingId = @p1
        `;

        await query(sql, [bookingId, checkedOutBy]);
        return await this.getById(bookingId);
    }

    /**
     * Lấy đặt phòng theo trạng thái
     * @param {string} status - Trạng thái đặt phòng
     * @returns {Promise<Array>} Danh sách đặt phòng
     */
    static async getByStatus(status) {
        const sql = `
            SELECT b.*, c.FirstName, c.LastName, c.Email, c.Phone,
                   r.RoomNumber, rt.TypeName, rt.BasePrice
            FROM Bookings b
            LEFT JOIN Customers c ON b.CustomerId = c.CustomerId
            LEFT JOIN Rooms r ON b.RoomId = r.RoomId
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            WHERE b.Status = @p1
            ORDER BY b.CreatedAt DESC
        `;
        return await query(sql, [status]);
    }

    /**
     * Lấy đặt phòng theo ngày
     * @param {string} date - Ngày cần kiểm tra
     * @returns {Promise<Array>} Danh sách đặt phòng
     */
    static async getByDate(date) {
        const sql = `
            SELECT b.*, c.FirstName, c.LastName, c.Email, c.Phone,
                   r.RoomNumber, rt.TypeName, rt.BasePrice
            FROM Bookings b
            LEFT JOIN Customers c ON b.CustomerId = c.CustomerId
            LEFT JOIN Rooms r ON b.RoomId = r.RoomId
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            WHERE b.CheckInDate <= @p1 AND b.CheckOutDate > @p1
            ORDER BY b.CheckInDate
        `;
        return await query(sql, [date]);
    }

    /**
     * Cập nhật trạng thái thanh toán
     * @param {number} id - ID đặt phòng
     * @param {string} paymentStatus - Trạng thái thanh toán
     * @returns {Promise<Object>} Đặt phòng đã cập nhật
     */
    static async updatePaymentStatus(id, paymentStatus) {
        const sql = `
            UPDATE Bookings SET PaymentStatus = @p2, UpdatedAt = GETDATE()
            WHERE BookingId = @p1
        `;

        await query(sql, [id, paymentStatus]);
        return await this.getById(id);
    }

    /**
     * Tạo mã đặt phòng tự động
     * @returns {Promise<string>} Mã đặt phòng
     */
    static async generateBookingCode() {
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        
        const prefix = `BK${year}${month}${day}`;
        
        const sql = `
            SELECT COUNT(*) as count FROM Bookings 
            WHERE BookingCode LIKE @p1
        `;
        
        const result = await query(sql, [`${prefix}%`]);
        const count = result[0].count + 1;
        
        return `${prefix}${count.toString().padStart(4, '0')}`;
    }
}

module.exports = Booking;

