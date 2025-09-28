const { query } = require('../config/db');

/**
 * Customer Model - Quản lý khách hàng
 */
class Customer {
    /**
     * Lấy tất cả khách hàng
     * @param {number} page - Trang hiện tại
     * @param {number} limit - Số lượng mỗi trang
     * @returns {Promise<Array>} Danh sách khách hàng
     */
    static async getAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const sql = `
            SELECT * FROM Customers 
            ORDER BY CreatedAt DESC 
            OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY
        `;
        return await query(sql, [offset, limit]);
    }

    /**
     * Lấy khách hàng theo ID
     * @param {number} id - ID khách hàng
     * @returns {Promise<Object>} Thông tin khách hàng
     */
    static async getById(id) {
        const sql = 'SELECT * FROM Customers WHERE CustomerId = @p1';
        const result = await query(sql, [id]);
        return result[0] || null;
    }

    /**
     * Tạo khách hàng mới
     * @param {Object} customerData - Dữ liệu khách hàng
     * @returns {Promise<Object>} Khách hàng vừa tạo
     */
    static async create(customerData) {
        const {
            customerCode, firstName, lastName, email, phone, address,
            nationality, passportNumber, idCardNumber, dateOfBirth,
            gender, customerType, loyaltyPoints, notes
        } = customerData;

        const sql = `
            INSERT INTO Customers (
                CustomerCode, FirstName, LastName, Email, Phone, Address,
                Nationality, PassportNumber, IdCardNumber, DateOfBirth,
                Gender, CustomerType, LoyaltyPoints, Notes
            ) VALUES (
                @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13, @p14
            );
            SELECT SCOPE_IDENTITY() as CustomerId;
        `;

        const result = await query(sql, [
            customerCode, firstName, lastName, email, phone, address,
            nationality, passportNumber, idCardNumber, dateOfBirth,
            gender, customerType, loyaltyPoints, notes
        ]);

        return await this.getById(result[0].CustomerId);
    }

    /**
     * Cập nhật thông tin khách hàng
     * @param {number} id - ID khách hàng
     * @param {Object} customerData - Dữ liệu cập nhật
     * @returns {Promise<Object>} Khách hàng đã cập nhật
     */
    static async update(id, customerData) {
        const {
            firstName, lastName, email, phone, address,
            nationality, passportNumber, idCardNumber, dateOfBirth,
            gender, customerType, loyaltyPoints, notes
        } = customerData;

        const sql = `
            UPDATE Customers SET
                FirstName = @p2, LastName = @p3, Email = @p4, Phone = @p5, Address = @p6,
                Nationality = @p7, PassportNumber = @p8, IdCardNumber = @p9, DateOfBirth = @p10,
                Gender = @p11, CustomerType = @p12, LoyaltyPoints = @p13, Notes = @p14,
                UpdatedAt = GETDATE()
            WHERE CustomerId = @p1
        `;

        await query(sql, [
            id, firstName, lastName, email, phone, address,
            nationality, passportNumber, idCardNumber, dateOfBirth,
            gender, customerType, loyaltyPoints, notes
        ]);

        return await this.getById(id);
    }

    /**
     * Xóa khách hàng
     * @param {number} id - ID khách hàng
     * @returns {Promise<boolean>} Kết quả xóa
     */
    static async delete(id) {
        const sql = 'DELETE FROM Customers WHERE CustomerId = @p1';
        const result = await query(sql, [id]);
        return result.rowsAffected > 0;
    }

    /**
     * Tìm kiếm khách hàng
     * @param {string} searchTerm - Từ khóa tìm kiếm
     * @returns {Promise<Array>} Danh sách khách hàng
     */
    static async search(searchTerm) {
        const sql = `
            SELECT * FROM Customers 
            WHERE FirstName LIKE @p1 OR LastName LIKE @p1 OR Email LIKE @p1 OR Phone LIKE @p1
            ORDER BY CreatedAt DESC
        `;
        const searchPattern = `%${searchTerm}%`;
        return await query(sql, [searchPattern]);
    }

    /**
     * Lấy lịch sử đặt phòng của khách hàng
     * @param {number} customerId - ID khách hàng
     * @returns {Promise<Array>} Lịch sử đặt phòng
     */
    static async getBookingHistory(customerId) {
        const sql = `
            SELECT b.*, r.RoomNumber, rt.TypeName, ci.CheckInTime, ci.CheckOutTime
            FROM Bookings b
            LEFT JOIN Rooms r ON b.RoomId = r.RoomId
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            LEFT JOIN CheckIns ci ON b.BookingId = ci.BookingId
            WHERE b.CustomerId = @p1
            ORDER BY b.CreatedAt DESC
        `;
        return await query(sql, [customerId]);
    }
}

module.exports = Customer;

