const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');

/**
 * Payment Controller - Xử lý logic thanh toán
 */
class PaymentController {
    /**
     * Lấy tất cả hóa đơn
     * GET /api/payments/invoices
     */
    static async getAllInvoices(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;

            let invoices;
            if (status) {
                invoices = await Invoice.getByStatus(status);
            } else {
                invoices = await Invoice.getAll(page, limit);
            }

            res.json({
                success: true,
                data: invoices,
                pagination: {
                    page,
                    limit,
                    total: invoices.length
                }
            });
        } catch (error) {
            console.error('Error getting invoices:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Lấy hóa đơn theo ID
     * GET /api/payments/invoices/:id
     */
    static async getInvoiceById(req, res) {
        try {
            const { id } = req.params;
            const invoice = await Invoice.getById(id);

            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
            }

            // Lấy chi tiết hóa đơn
            const items = await Invoice.getItems(id);
            const payments = await Invoice.getPayments(id);

            res.json({
                success: true,
                data: {
                    ...invoice,
                    items,
                    payments
                }
            });
        } catch (error) {
            console.error('Error getting invoice:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Tạo hóa đơn mới
     * POST /api/payments/invoices
     */
    static async createInvoice(req, res) {
        try {
            const {
                customerId, bookingId, invoiceDate, dueDate,
                subtotal, taxAmount, discountAmount, totalAmount, notes
            } = req.body;

            // Kiểm tra khách hàng tồn tại
            const customer = await Customer.getById(customerId);
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            // Kiểm tra đặt phòng tồn tại (nếu có)
            if (bookingId) {
                const booking = await Booking.getById(bookingId);
                if (!booking) {
                    return res.status(404).json({
                        success: false,
                        message: 'Booking not found'
                    });
                }
            }

            // Tạo mã hóa đơn
            const invoiceNumber = await Invoice.generateInvoiceNumber();

            const invoiceData = {
                invoiceNumber,
                customerId,
                bookingId,
                invoiceDate: invoiceDate || new Date().toISOString().split('T')[0],
                dueDate: dueDate || new Date().toISOString().split('T')[0],
                subtotal: subtotal || 0,
                taxAmount: taxAmount || 0,
                discountAmount: discountAmount || 0,
                totalAmount: totalAmount || 0,
                status: 'draft',
                notes,
                createdBy: req.user.userId
            };

            const invoice = await Invoice.create(invoiceData);

            res.status(201).json({
                success: true,
                message: 'Invoice created successfully',
                data: invoice
            });
        } catch (error) {
            console.error('Error creating invoice:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Cập nhật hóa đơn
     * PUT /api/payments/invoices/:id
     */
    static async updateInvoice(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Kiểm tra hóa đơn tồn tại
            const existingInvoice = await Invoice.getById(id);
            if (!existingInvoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
            }

            // Không cho phép cập nhật nếu đã thanh toán
            if (existingInvoice.Status === 'paid') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot update paid invoice'
                });
            }

            const invoice = await Invoice.update(id, updateData);

            res.json({
                success: true,
                message: 'Invoice updated successfully',
                data: invoice
            });
        } catch (error) {
            console.error('Error updating invoice:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Thêm chi tiết hóa đơn
     * POST /api/payments/invoices/:id/items
     */
    static async addInvoiceItem(req, res) {
        try {
            const { id } = req.params;
            const itemData = req.body;

            // Kiểm tra hóa đơn tồn tại
            const invoice = await Invoice.getById(id);
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
            }

            const item = await Invoice.addItem(id, itemData);

            // Cập nhật tổng tiền hóa đơn
            const items = await Invoice.getItems(id);
            const subtotal = items.reduce((sum, item) => sum + item.TotalPrice, 0);
            const taxAmount = subtotal * 0.1; // 10% VAT
            const totalAmount = subtotal + taxAmount;

            await Invoice.update(id, {
                subtotal,
                taxAmount,
                totalAmount,
                status: invoice.Status
            });

            res.status(201).json({
                success: true,
                message: 'Invoice item added successfully',
                data: item
            });
        } catch (error) {
            console.error('Error adding invoice item:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Tạo thanh toán
     * POST /api/payments
     */
    static async createPayment(req, res) {
        try {
            const {
                invoiceId, paymentDate, amount, paymentMethod,
                referenceNumber, notes
            } = req.body;

            // Kiểm tra hóa đơn tồn tại
            const invoice = await Invoice.getById(invoiceId);
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
            }

            // Kiểm tra số tiền thanh toán
            if (amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment amount must be greater than 0'
                });
            }

            // Lấy tổng số tiền đã thanh toán
            const payments = await Invoice.getPayments(invoiceId);
            const paidAmount = payments.reduce((sum, payment) => sum + payment.Amount, 0);
            const remainingAmount = invoice.TotalAmount - paidAmount;

            if (amount > remainingAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Payment amount cannot exceed remaining amount: ${remainingAmount}`
                });
            }

            // Tạo mã thanh toán
            const paymentNumber = await Invoice.generatePaymentNumber();

            const paymentData = {
                paymentNumber,
                invoiceId,
                paymentDate: paymentDate || new Date().toISOString().split('T')[0],
                amount,
                paymentMethod,
                referenceNumber,
                notes,
                processedBy: req.user.userId
            };

            const payment = await Invoice.createPayment(paymentData);

            res.status(201).json({
                success: true,
                message: 'Payment created successfully',
                data: payment
            });
        } catch (error) {
            console.error('Error creating payment:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Lấy lịch sử thanh toán
     * GET /api/payments/invoices/:id/payments
     */
    static async getPayments(req, res) {
        try {
            const { id } = req.params;

            // Kiểm tra hóa đơn tồn tại
            const invoice = await Invoice.getById(id);
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
            }

            const payments = await Invoice.getPayments(id);

            res.json({
                success: true,
                data: payments
            });
        } catch (error) {
            console.error('Error getting payments:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Lấy báo cáo doanh thu
     * GET /api/payments/revenue-report
     */
    static async getRevenueReport(req, res) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required'
                });
            }

            const report = await Invoice.getRevenueReport(startDate, endDate);

            res.json({
                success: true,
                data: report
            });
        } catch (error) {
            console.error('Error getting revenue report:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Lấy hóa đơn theo khách hàng
     * GET /api/payments/customers/:id/invoices
     */
    static async getInvoicesByCustomer(req, res) {
        try {
            const { id } = req.params;

            // Kiểm tra khách hàng tồn tại
            const customer = await Customer.getById(id);
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            const sql = `
                SELECT i.*, b.BookingCode, r.RoomNumber
                FROM Invoices i
                LEFT JOIN Bookings b ON i.BookingId = b.BookingId
                LEFT JOIN Rooms r ON b.RoomId = r.RoomId
                WHERE i.CustomerId = @p1
                ORDER BY i.CreatedAt DESC
            `;

            const { query } = require('../config/db');
            const invoices = await query(sql, [id]);

            res.json({
                success: true,
                data: invoices
            });
        } catch (error) {
            console.error('Error getting customer invoices:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * In hóa đơn
     * GET /api/payments/invoices/:id/print
     */
    static async printInvoice(req, res) {
        try {
            const { id } = req.params;

            const invoice = await Invoice.getById(id);
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found'
                });
            }

            const items = await Invoice.getItems(id);
            const payments = await Invoice.getPayments(id);

            // Trong thực tế, bạn có thể sử dụng thư viện như PDFKit để tạo PDF
            // Ở đây chúng ta chỉ trả về dữ liệu để frontend xử lý
            res.json({
                success: true,
                data: {
                    invoice,
                    items,
                    payments,
                    printDate: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error printing invoice:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = PaymentController;

