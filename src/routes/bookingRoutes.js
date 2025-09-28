const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

/**
 * Booking Routes - RESTful API cho quản lý đặt phòng
 */

// Middleware xác thực cho tất cả routes
router.use(authenticate);

// GET /api/bookings - Lấy tất cả đặt phòng
router.get('/', 
    authorize('admin', 'manager', 'receptionist', 'accountant'),
    BookingController.getAllBookings
);

// GET /api/bookings/available-rooms - Lấy phòng trống
router.get('/available-rooms',
    authorize('admin', 'manager', 'receptionist', 'sales'),
    BookingController.getAvailableRooms
);

// GET /api/bookings/by-date/:date - Lấy đặt phòng theo ngày
router.get('/by-date/:date',
    authorize('admin', 'manager', 'receptionist', 'accountant'),
    BookingController.getBookingsByDate
);

// GET /api/bookings/:id - Lấy đặt phòng theo ID
router.get('/:id',
    authorize('admin', 'manager', 'receptionist', 'accountant'),
    BookingController.getBookingById
);

// POST /api/bookings - Tạo đặt phòng mới
router.post('/',
    authorize('admin', 'manager', 'receptionist', 'sales'),
    validateBooking,
    BookingController.createBooking
);

// PUT /api/bookings/:id - Cập nhật đặt phòng
router.put('/:id',
    authorize('admin', 'manager', 'receptionist'),
    validateBooking,
    BookingController.updateBooking
);

// DELETE /api/bookings/:id - Hủy đặt phòng
router.delete('/:id',
    authorize('admin', 'manager', 'receptionist'),
    BookingController.cancelBooking
);

// POST /api/bookings/:id/checkin - Check-in
router.post('/:id/checkin',
    authorize('admin', 'manager', 'receptionist'),
    BookingController.checkIn
);

// POST /api/bookings/:id/checkout - Check-out
router.post('/:id/checkout',
    authorize('admin', 'manager', 'receptionist'),
    BookingController.checkOut
);

module.exports = router;

