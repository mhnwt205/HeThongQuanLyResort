const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validation');

/**
 * Payment Routes - RESTful API cho quản lý thanh toán
 */

// Middleware xác thực cho tất cả routes
router.use(authenticate);

// GET /api/payments/revenue-report - Báo cáo doanh thu
router.get('/revenue-report',
    authorize('admin', 'manager', 'accountant'),
    PaymentController.getRevenueReport
);

// GET /api/payments/invoices - Lấy tất cả hóa đơn
router.get('/invoices',
    authorize('admin', 'manager', 'accountant', 'cashier'),
    PaymentController.getAllInvoices
);

// GET /api/payments/invoices/:id - Lấy hóa đơn theo ID
router.get('/invoices/:id',
    authorize('admin', 'manager', 'accountant', 'cashier'),
    PaymentController.getInvoiceById
);

// GET /api/payments/invoices/:id/print - In hóa đơn
router.get('/invoices/:id/print',
    authorize('admin', 'manager', 'accountant', 'cashier'),
    PaymentController.printInvoice
);

// GET /api/payments/invoices/:id/payments - Lấy lịch sử thanh toán
router.get('/invoices/:id/payments',
    authorize('admin', 'manager', 'accountant', 'cashier'),
    PaymentController.getPayments
);

// GET /api/payments/customers/:id/invoices - Lấy hóa đơn theo khách hàng
router.get('/customers/:id/invoices',
    authorize('admin', 'manager', 'accountant', 'cashier'),
    PaymentController.getInvoicesByCustomer
);

// POST /api/payments/invoices - Tạo hóa đơn mới
router.post('/invoices',
    authorize('admin', 'manager', 'accountant'),
    PaymentController.createInvoice
);

// PUT /api/payments/invoices/:id - Cập nhật hóa đơn
router.put('/invoices/:id',
    authorize('admin', 'manager', 'accountant'),
    PaymentController.updateInvoice
);

// POST /api/payments/invoices/:id/items - Thêm chi tiết hóa đơn
router.post('/invoices/:id/items',
    authorize('admin', 'manager', 'accountant'),
    PaymentController.addInvoiceItem
);

// POST /api/payments - Tạo thanh toán
router.post('/',
    authorize('admin', 'manager', 'accountant', 'cashier'),
    validatePayment,
    PaymentController.createPayment
);

module.exports = router;

