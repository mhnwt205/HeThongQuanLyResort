const express = require('express');
const BookingController = require('../controllers/bookingController');

const router = express.Router();

// Routes cho khách hàng
router.get('/', BookingController.showBookingPage);
router.post('/create', BookingController.createBooking);
router.get('/detail/:code', BookingController.showBookingDetail);
router.post('/cancel', BookingController.cancelBooking);
router.get('/search', BookingController.searchBooking);

// MoMo Payment Routes
router.get('/payment/momo/qr', BookingController.showMoMoQR);
router.get('/payment/momo/mock', BookingController.showMockMoMoPayment);
router.get('/payment/momo/return', BookingController.handleMoMoReturn);
router.post('/payment/momo/notify', BookingController.handleMoMoNotify);

module.exports = router;