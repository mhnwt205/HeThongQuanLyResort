const express = require('express');
const router = express.Router();

// Import route modules
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');

/**
 * Main API Routes
 */

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Resort Management API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
    res.json({
        success: true,
        message: 'Resort Management API Documentation',
        endpoints: {
            bookings: {
                'GET /api/bookings': 'Get all bookings',
                'GET /api/bookings/:id': 'Get booking by ID',
                'POST /api/bookings': 'Create new booking',
                'PUT /api/bookings/:id': 'Update booking',
                'DELETE /api/bookings/:id': 'Cancel booking',
                'POST /api/bookings/:id/checkin': 'Check-in',
                'POST /api/bookings/:id/checkout': 'Check-out',
                'GET /api/bookings/available-rooms': 'Get available rooms',
                'GET /api/bookings/by-date/:date': 'Get bookings by date'
            },
            payments: {
                'GET /api/payments/invoices': 'Get all invoices',
                'GET /api/payments/invoices/:id': 'Get invoice by ID',
                'POST /api/payments/invoices': 'Create new invoice',
                'PUT /api/payments/invoices/:id': 'Update invoice',
                'POST /api/payments/invoices/:id/items': 'Add invoice item',
                'POST /api/payments': 'Create payment',
                'GET /api/payments/invoices/:id/payments': 'Get payment history',
                'GET /api/payments/revenue-report': 'Get revenue report',
                'GET /api/payments/customers/:id/invoices': 'Get customer invoices',
                'GET /api/payments/invoices/:id/print': 'Print invoice'
            }
        },
        authentication: {
            type: 'Bearer Token',
            header: 'Authorization: Bearer <token>'
        },
        roles: {
            admin: 'Full access',
            manager: 'Management access',
            receptionist: 'Front desk operations',
            accountant: 'Financial operations',
            cashier: 'Payment processing',
            sales: 'Sales operations'
        }
    });
});

// Mount route modules
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;

