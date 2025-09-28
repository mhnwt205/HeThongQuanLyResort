const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const loginValidation = [
    body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
    body('role').isIn(['customer', 'admin']).withMessage('Role không hợp lệ')
];

const registerValidation = [
    body('username')
        .isLength({ min: 3 }).withMessage('Tên đăng nhập phải có ít nhất 3 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('firstName').notEmpty().withMessage('Họ là bắt buộc'),
    body('lastName').notEmpty().withMessage('Tên là bắt buộc'),
    body('phone').isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ')
];

const updateProfileValidation = [
    body('firstName').optional().notEmpty().withMessage('Họ không được để trống'),
    body('lastName').optional().notEmpty().withMessage('Tên không được để trống'),
    body('phone').optional().isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
    body('email').optional().isEmail().withMessage('Email không hợp lệ')
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại là bắt buộc'),
    body('newPassword')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Mật khẩu xác nhận không khớp');
        }
        return true;
    })
];

// Routes
// Hiển thị trang đăng nhập
router.get('/login', AuthController.showLogin);

// Hiển thị trang đăng ký
router.get('/register', AuthController.showRegister);

// Xử lý đăng nhập
router.post('/login', loginValidation, AuthController.login);

// Xử lý đăng ký
router.post('/register', registerValidation, AuthController.register);

// Đăng xuất
router.post('/logout', AuthController.logout);
router.get('/logout', AuthController.logout);

// Lấy thông tin profile (cần đăng nhập)
router.get('/profile', authenticate, AuthController.getProfile);

// Cập nhật profile (cần đăng nhập)
router.put('/profile', authenticate, updateProfileValidation, AuthController.updateProfile);

// Đổi mật khẩu (cần đăng nhập)
router.put('/change-password', authenticate, changePasswordValidation, AuthController.changePassword);

module.exports = router;
