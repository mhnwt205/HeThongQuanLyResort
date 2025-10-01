const { body, validationResult } = require('express-validator');

/**
 * Middleware xử lý lỗi validation cho API
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Middleware xử lý lỗi validation cho Web routes
 */
const handleWebValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // For web routes, we let the controller handle the error rendering
    // This middleware just passes the errors to the next middleware
    req.validationErrors = errors.array();
  }
  next();
};

/**
 * Validation rules cho Booking
 */
const validateBooking = [
  body('customerId').isInt().withMessage('Customer ID must be a valid integer'),
  body('roomId').isInt().withMessage('Room ID must be a valid integer'),
  body('checkInDate').isISO8601().withMessage('Check-in date must be a valid date'),
  body('checkOutDate').isISO8601().withMessage('Check-out date must be a valid date'),
  body('adults').isInt({ min: 1 }).withMessage('Adults must be at least 1'),
  body('children').isInt({ min: 0 }).withMessage('Children must be 0 or more'),
  handleValidationErrors
];

/**
 * Validation rules cho Payment
 */
const validatePayment = [
  body('bookingId').isInt().withMessage('Booking ID must be a valid integer'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentMethod').isIn(['cash', 'credit_card', 'bank_transfer', 'voucher']).withMessage('Invalid payment method'),
  handleValidationErrors
];

/**
 * Validation rules cho Customer
 */
const validateCustomer = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  handleWebValidationErrors,
  validateBooking,
  validatePayment,
  validateCustomer
};

