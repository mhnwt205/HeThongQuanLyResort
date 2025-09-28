const { query } = require('../config/db');

/**
 * Invoice Model - Quản lý hóa đơn và thanh toán
 */
class Invoice {
    /**
     * Lấy tất cả hóa đơn
     * @param {number} page - Trang hiện tại
     * @param {number} limit - Số lượng mỗi trang
     * @returns {Promise<Array>} Danh sách hóa đơn
     */
    static async getAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const sql = `
            SELECT i.*, c.FirstName, c.LastName, c.Email, c.Phone,
                   b.BookingCode, r.RoomNumber
            FROM Invoices i
            LEFT JOIN Customers c ON i.CustomerId = c.CustomerId
            LEFT JOIN Bookings b ON i.BookingId = b.BookingId
            LEFT JOIN Rooms r ON b.RoomId = r.RoomId
            ORDER BY i.CreatedAt DESC
            OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY
        `;
        return await query(sql, [offset, limit]);
    }

    /**
     * Lấy hóa đơn theo ID
     * @param {number} id - ID hóa đơn
     * @returns {Promise<Object>} Thông tin hóa đơn
     */
    static async getById(id) {
        const sql = `
            SELECT i.*, c.FirstName, c.LastName, c.Email, c.Phone, c.CustomerCode,
                   b.BookingCode, r.RoomNumber, rt.TypeName
            FROM Invoices i
            LEFT JOIN Customers c ON i.CustomerId = c.CustomerId
            LEFT JOIN Bookings b ON i.BookingId = b.BookingId
            LEFT JOIN Rooms r ON b.RoomId = r.RoomId
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            WHERE i.InvoiceId = @p1
        `;
        const result = await query(sql, [id]);
        return result[0] || null;
    }

    /**
     * Lấy hóa đơn theo số hóa đơn
     * @param {string} invoiceNumber - Số hóa đơn
     * @returns {Promise<Object>} Thông tin hóa đơn
     */
    static async getByNumber(invoiceNumber) {
        const sql = `
            SELECT i.*, c.FirstName, c.LastName, c.Email, c.Phone, c.CustomerCode,
                   b.BookingCode, r.RoomNumber, rt.TypeName
            FROM Invoices i
            LEFT JOIN Customers c ON i.CustomerId = c.CustomerId
            LEFT JOIN Bookings b ON i.BookingId = b.BookingId
            LEFT JOIN Rooms r ON b.RoomId = r.RoomId
            LEFT JOIN RoomTypes rt ON r.RoomTypeId = rt.RoomTypeId
            WHERE i.InvoiceNumber = @p1
        `;
        const result = await query(sql, [invoiceNumber]);
        return result[0] || null;
    }

    /**
     * Tạo hóa đơn mới
     * @param {Object} invoiceData - Dữ liệu hóa đơn
     * @returns {Promise<Object>} Hóa đơn vừa tạo
     */
    static async create(invoiceData) {
        const {
            invoiceNumber, customerId, bookingId, invoiceDate, dueDate,
            subtotal, taxAmount, discountAmount, totalAmount, status, notes, createdBy
        } = invoiceData;

        const sql = `
            INSERT INTO Invoices (
                InvoiceNumber, CustomerId, BookingId, InvoiceDate, DueDate,
                Subtotal, TaxAmount, DiscountAmount, TotalAmount, Status, Notes, CreatedBy
            ) VALUES (
                @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12
            );
            SELECT SCOPE_IDENTITY() as InvoiceId;
        `;

        const result = await query(sql, [
            invoiceNumber, customerId, bookingId, invoiceDate, dueDate,
            subtotal, taxAmount, discountAmount, totalAmount, status, notes, createdBy
        ]);

        return await this.getById(result[0].InvoiceId);
    }

    /**
     * Cập nhật hóa đơn
     * @param {number} id - ID hóa đơn
     * @param {Object} invoiceData - Dữ liệu cập nhật
     * @returns {Promise<Object>} Hóa đơn đã cập nhật
     */
    static async update(id, invoiceData) {
        const {
            subtotal, taxAmount, discountAmount, totalAmount, status, notes
        } = invoiceData;

        const sql = `
            UPDATE Invoices SET
                Subtotal = @p2, TaxAmount = @p3, DiscountAmount = @p4,
                TotalAmount = @p5, Status = @p6, Notes = @p7,
                UpdatedAt = GETDATE()
            WHERE InvoiceId = @p1
        `;

        await query(sql, [id, subtotal, taxAmount, discountAmount, totalAmount, status, notes]);
        return await this.getById(id);
    }

    /**
     * Thêm chi tiết hóa đơn
     * @param {number} invoiceId - ID hóa đơn
     * @param {Object} itemData - Dữ liệu chi tiết
     * @returns {Promise<Object>} Chi tiết vừa thêm
     */
    static async addItem(invoiceId, itemData) {
        const { itemType, itemName, description, quantity, unitPrice, totalPrice } = itemData;

        const sql = `
            INSERT INTO InvoiceItems (InvoiceId, ItemType, ItemName, Description, Quantity, UnitPrice, TotalPrice)
            VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7);
            SELECT SCOPE_IDENTITY() as ItemId;
        `;

        const result = await query(sql, [invoiceId, itemType, itemName, description, quantity, unitPrice, totalPrice]);
        return result[0];
    }

    /**
     * Lấy chi tiết hóa đơn
     * @param {number} invoiceId - ID hóa đơn
     * @returns {Promise<Array>} Danh sách chi tiết
     */
    static async getItems(invoiceId) {
        const sql = 'SELECT * FROM InvoiceItems WHERE InvoiceId = @p1 ORDER BY ItemId';
        return await query(sql, [invoiceId]);
    }

    /**
     * Tạo thanh toán
     * @param {Object} paymentData - Dữ liệu thanh toán
     * @returns {Promise<Object>} Thanh toán vừa tạo
     */
    static async createPayment(paymentData) {
        const {
            paymentNumber, invoiceId, paymentDate, amount, paymentMethod,
            referenceNumber, notes, processedBy
        } = paymentData;

        const sql = `
            INSERT INTO Payments (
                PaymentNumber, InvoiceId, PaymentDate, Amount, PaymentMethod,
                ReferenceNumber, Notes, ProcessedBy
            ) VALUES (
                @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8
            );
            SELECT SCOPE_IDENTITY() as PaymentId;
        `;

        const result = await query(sql, [
            paymentNumber, invoiceId, paymentDate, amount, paymentMethod,
            referenceNumber, notes, processedBy
        ]);

        // Cập nhật trạng thái hóa đơn nếu đã thanh toán đủ
        await this.updatePaymentStatus(invoiceId);

        return result[0];
    }

    /**
     * Cập nhật trạng thái thanh toán hóa đơn
     * @param {number} invoiceId - ID hóa đơn
     * @returns {Promise<void>}
     */
    static async updatePaymentStatus(invoiceId) {
        const sql = `
            SELECT 
                i.TotalAmount,
                ISNULL(SUM(p.Amount), 0) as PaidAmount
            FROM Invoices i
            LEFT JOIN Payments p ON i.InvoiceId = p.InvoiceId
            WHERE i.InvoiceId = @p1
            GROUP BY i.InvoiceId, i.TotalAmount
        `;

        const result = await query(sql, [invoiceId]);
        if (result.length > 0) {
            const { TotalAmount, PaidAmount } = result[0];
            let status = 'draft';

            if (PaidAmount >= TotalAmount) {
                status = 'paid';
            } else if (PaidAmount > 0) {
                status = 'partial';
            }

            await query(
                'UPDATE Invoices SET Status = @p2, UpdatedAt = GETDATE() WHERE InvoiceId = @p1',
                [invoiceId, status]
            );
        }
    }

    /**
     * Lấy lịch sử thanh toán
     * @param {number} invoiceId - ID hóa đơn
     * @returns {Promise<Array>} Lịch sử thanh toán
     */
    static async getPayments(invoiceId) {
        const sql = `
            SELECT p.*, u.Username as ProcessedByUser
            FROM Payments p
            LEFT JOIN Users u ON p.ProcessedBy = u.UserId
            WHERE p.InvoiceId = @p1
            ORDER BY p.CreatedAt DESC
        `;
        return await query(sql, [invoiceId]);
    }

    /**
     * Lấy hóa đơn theo trạng thái
     * @param {string} status - Trạng thái hóa đơn
     * @returns {Promise<Array>} Danh sách hóa đơn
     */
    static async getByStatus(status) {
        const sql = `
            SELECT i.*, c.FirstName, c.LastName, c.Email, c.Phone,
                   b.BookingCode, r.RoomNumber
            FROM Invoices i
            LEFT JOIN Customers c ON i.CustomerId = c.CustomerId
            LEFT JOIN Bookings b ON i.BookingId = b.BookingId
            LEFT JOIN Rooms r ON b.RoomId = r.RoomId
            WHERE i.Status = @p1
            ORDER BY i.CreatedAt DESC
        `;
        return await query(sql, [status]);
    }

    /**
     * Tạo mã hóa đơn tự động
     * @returns {Promise<string>} Mã hóa đơn
     */
    static async generateInvoiceNumber() {
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        
        const prefix = `INV${year}${month}${day}`;
        
        const sql = `
            SELECT COUNT(*) as count FROM Invoices 
            WHERE InvoiceNumber LIKE @p1
        `;
        
        const result = await query(sql, [`${prefix}%`]);
        const count = result[0].count + 1;
        
        return `${prefix}${count.toString().padStart(4, '0')}`;
    }

    /**
     * Tạo mã thanh toán tự động
     * @returns {Promise<string>} Mã thanh toán
     */
    static async generatePaymentNumber() {
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        
        const prefix = `PAY${year}${month}${day}`;
        
        const sql = `
            SELECT COUNT(*) as count FROM Payments 
            WHERE PaymentNumber LIKE @p1
        `;
        
        const result = await query(sql, [`${prefix}%`]);
        const count = result[0].count + 1;
        
        return `${prefix}${count.toString().padStart(4, '0')}`;
    }

    /**
     * Lấy báo cáo doanh thu theo ngày
     * @param {string} startDate - Ngày bắt đầu
     * @param {string} endDate - Ngày kết thúc
     * @returns {Promise<Object>} Báo cáo doanh thu
     */
    static async getRevenueReport(startDate, endDate) {
        const sql = `
            SELECT 
                COUNT(*) as TotalInvoices,
                SUM(TotalAmount) as TotalRevenue,
                SUM(CASE WHEN Status = 'paid' THEN TotalAmount ELSE 0 END) as PaidRevenue,
                SUM(CASE WHEN Status = 'partial' THEN TotalAmount ELSE 0 END) as PartialRevenue,
                SUM(CASE WHEN Status = 'draft' THEN TotalAmount ELSE 0 END) as PendingRevenue
            FROM Invoices
            WHERE InvoiceDate BETWEEN @p1 AND @p2
        `;
        
        const result = await query(sql, [startDate, endDate]);
        return result[0] || {};
    }
}

module.exports = Invoice;

