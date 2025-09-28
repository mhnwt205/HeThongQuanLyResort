const { query } = require('../config/db');

/**
 * Room Model - Quản lý phòng
 */
class Room {
    /**
     * Lấy tất cả phòng
     * @param {number} page - Trang hiện tại
     * @param {number} limit - Số lượng mỗi trang
     * @returns {Promise<Array>} Danh sách phòng
     */
    static async getAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const sql = `
            SELECT r.*, rt.TypeName, rt.BasePrice, rt.MaxOccupancy, rt.Amenities
            FROM Rooms r
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            ORDER BY r.RoomNumber
            OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY
        `;
        return await query(sql, [offset, limit]);
    }

    /**
     * Lấy phòng theo ID
     * @param {number} id - ID phòng
     * @returns {Promise<Object>} Thông tin phòng
     */
    static async getById(id) {
        const sql = `
            SELECT r.*, rt.TypeName, rt.BasePrice, rt.MaxOccupancy, rt.Amenities
            FROM Rooms r
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            WHERE r.RoomId = @p1
        `;
        const result = await query(sql, [id]);
        return result[0] || null;
    }

    /**
     * Lấy phòng theo số phòng
     * @param {string} roomNumber - Số phòng
     * @returns {Promise<Object>} Thông tin phòng
     */
    static async getByRoomNumber(roomNumber) {
        const sql = `
            SELECT r.*, rt.TypeName, rt.BasePrice, rt.MaxOccupancy, rt.Amenities
            FROM Rooms r
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            WHERE r.RoomNumber = @p1
        `;
        const result = await query(sql, [roomNumber]);
        return result[0] || null;
    }

    /**
     * Lấy phòng trống
     * @param {string} checkInDate - Ngày check-in
     * @param {string} checkOutDate - Ngày check-out
     * @param {number} roomTypeId - ID loại phòng (optional)
     * @returns {Promise<Array>} Danh sách phòng trống
     */
    static async getAvailable(checkInDate, checkOutDate, roomTypeId = null) {
        let sql = `
            SELECT r.*, rt.TypeName, rt.BasePrice, rt.MaxOccupancy, rt.Amenities
            FROM Rooms r
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            WHERE r.Status = 'available'
            AND r.RoomId NOT IN (
                SELECT DISTINCT b.RoomId
                FROM Bookings b
                WHERE b.Status IN ('confirmed', 'checked_in')
                AND (
                    (b.CheckInDate <= @p1 AND b.CheckOutDate > @p1) OR
                    (b.CheckInDate < @p2 AND b.CheckOutDate >= @p2) OR
                    (b.CheckInDate >= @p1 AND b.CheckOutDate <= @p2)
                )
            )
        `;

        const params = [checkInDate, checkOutDate];

        if (roomTypeId) {
            sql += ' AND r.RoomTypeId = @p3';
            params.push(roomTypeId);
        }

        sql += ' ORDER BY r.RoomNumber';

        return await query(sql, params);
    }

    /**
     * Tạo phòng mới
     * @param {Object} roomData - Dữ liệu phòng
     * @returns {Promise<Object>} Phòng vừa tạo
     */
    static async create(roomData) {
        const { roomNumber, roomTypeId, floorNumber, status, notes } = roomData;

        const sql = `
            INSERT INTO Rooms (RoomNumber, RoomTypeId, FloorNumber, Status, Notes)
            VALUES (@p1, @p2, @p3, @p4, @p5);
            SELECT SCOPE_IDENTITY() as RoomId;
        `;

        const result = await query(sql, [roomNumber, roomTypeId, floorNumber, status, notes]);
        return await this.getById(result[0].RoomId);
    }

    /**
     * Cập nhật thông tin phòng
     * @param {number} id - ID phòng
     * @param {Object} roomData - Dữ liệu cập nhật
     * @returns {Promise<Object>} Phòng đã cập nhật
     */
    static async update(id, roomData) {
        const { roomTypeId, floorNumber, status, notes } = roomData;

        const sql = `
            UPDATE Rooms SET
                RoomTypeId = @p2, FloorNumber = @p3, Status = @p4, Notes = @p5,
                UpdatedAt = GETDATE()
            WHERE RoomId = @p1
        `;

        await query(sql, [id, roomTypeId, floorNumber, status, notes]);
        return await this.getById(id);
    }

    /**
     * Cập nhật trạng thái phòng
     * @param {number} id - ID phòng
     * @param {string} status - Trạng thái mới
     * @returns {Promise<Object>} Phòng đã cập nhật
     */
    static async updateStatus(id, status) {
        const sql = `
            UPDATE Rooms SET Status = @p2, UpdatedAt = GETDATE()
            WHERE RoomId = @p1
        `;

        await query(sql, [id, status]);
        return await this.getById(id);
    }

    /**
     * Xóa phòng
     * @param {number} id - ID phòng
     * @returns {Promise<boolean>} Kết quả xóa
     */
    static async delete(id) {
        const sql = 'DELETE FROM Rooms WHERE RoomId = @p1';
        const result = await query(sql, [id]);
        return result.rowsAffected > 0;
    }

    /**
     * Lấy phòng theo trạng thái
     * @param {string} status - Trạng thái phòng
     * @returns {Promise<Array>} Danh sách phòng
     */
    static async getByStatus(status) {
        const sql = `
            SELECT r.*, rt.TypeName, rt.BasePrice, rt.MaxOccupancy, rt.Amenities
            FROM Rooms r
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            WHERE r.Status = @p1
            ORDER BY r.RoomNumber
        `;
        return await query(sql, [status]);
    }

    /**
     * Lấy tất cả loại phòng
     * @returns {Promise<Array>} Danh sách loại phòng
     */
    static async getRoomTypes() {
        const sql = 'SELECT * FROM RoomTypes ORDER BY TypeName';
        return await query(sql);
    }

    /**
     * Lấy thống kê phòng
     * @returns {Promise<Object>} Thống kê phòng
     */
    static async getStatistics() {
        const sql = `
            SELECT 
                Status,
                COUNT(*) as Count
            FROM Rooms
            GROUP BY Status
        `;
        const result = await query(sql);
        
        const stats = {
            total: 0,
            available: 0,
            occupied: 0,
            maintenance: 0,
            cleaning: 0,
            out_of_order: 0
        };

        result.forEach(row => {
            stats.total += row.Count;
            stats[row.Status.toLowerCase()] = row.Count;
        });

        return stats;
    }
}

module.exports = Room;

