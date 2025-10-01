const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

class AuthController {
    // Hiển thị trang đăng nhập
    static async showLogin(req, res) {
        try {
            res.render('auth/login', {
                title: 'Đăng nhập - Paradise Resort & Spa'
            });
        } catch (error) {
            console.error('Error showing login page:', error);
            res.status(500).render('error', {
                title: 'Lỗi - Paradise Resort & Spa',
                message: 'Đã xảy ra lỗi khi tải trang đăng nhập'
            });
        }
    }

    // Hiển thị trang đăng ký
    static async showRegister(req, res) {
        try {
            res.render('auth/register', {
                title: 'Đăng ký - Paradise Resort & Spa'
            });
        } catch (error) {
            console.error('Error showing register page:', error);
            res.status(500).render('error', {
                title: 'Lỗi - Paradise Resort & Spa',
                message: 'Đã xảy ra lỗi khi tải trang đăng ký'
            });
        }
    }

    // Xử lý đăng nhập
    static async login(req, res) {
        try {
            // Check for validation errors from middleware
            if (req.validationErrors && req.validationErrors.length > 0) {
                return res.render('auth/login', {
                    title: 'Đăng nhập - Paradise Resort & Spa',
                    errors: req.validationErrors,
                    formData: req.body
                });
            }

            const { email, username, password, role } = req.body;
            const identifier = email || username;

            // Tìm user
            const user = await User.findByEmailOrUsername(identifier);
            if (!user) {
                return res.render('auth/login', {
                    title: 'Đăng nhập - Paradise Resort & Spa',
                    errors: [{ msg: 'Email/Username hoặc mật khẩu không đúng' }],
                    formData: req.body
                });
            }

            // Kiểm tra role
            if (user.role !== role) {
                return res.render('auth/login', {
                    title: 'Đăng nhập - Paradise Resort & Spa',
                    errors: [{ msg: 'Bạn không có quyền truy cập với vai trò này' }],
                    formData: req.body
                });
            }

            // Xác thực password
            const isValidPassword = await User.validatePassword(password, user.password);
            if (!isValidPassword) {
                return res.render('auth/login', {
                    title: 'Đăng nhập - Paradise Resort & Spa',
                    errors: [{ msg: 'Email/Username hoặc mật khẩu không đúng' }],
                    formData: req.body
                });
            }

            // Tạo JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username, 
                    email: user.email, 
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            // Set session
            req.session.userId = user.id;
            req.session.userRole = user.role;
            req.session.username = user.username;
            req.session.firstName = user.firstName;
            req.session.isLoggedIn = true;

            // Redirect based on role
            if (role === 'admin') {
                return res.redirect('/admin');
            } else {
                return res.redirect('/');
            }

        } catch (error) {
            console.error('Login error:', error);
            return res.render('auth/login', {
                title: 'Đăng nhập - Paradise Resort & Spa',
                errors: [{ msg: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.' }],
                formData: req.body
            });
        }
    }

    // Xử lý đăng ký
    static async register(req, res) {
        try {
            // Check for validation errors from middleware
            if (req.validationErrors && req.validationErrors.length > 0) {
                return res.render('auth/register', {
                    title: 'Đăng ký - Paradise Resort & Spa',
                    errors: req.validationErrors,
                    formData: req.body
                });
            }

            const { 
                username, 
                email, 
                password, 
                confirmPassword, 
                firstName, 
                lastName, 
                phone, 
                address, 
                dateOfBirth, 
                gender,
                role = 'customer'
            } = req.body;

            // Kiểm tra password confirmation
            if (password !== confirmPassword) {
                return res.render('auth/register', {
                    title: 'Đăng ký - Paradise Resort & Spa',
                    errors: [{ msg: 'Mật khẩu xác nhận không khớp' }],
                    formData: req.body
                });
            }

            // Kiểm tra email/username đã tồn tại
            const emailExists = email ? await User.exists(email) : false;
            if (emailExists) {
                return res.render('auth/register', {
                    title: 'Đăng ký - Paradise Resort & Spa',
                    errors: [{ msg: 'Email đã được sử dụng' }],
                    formData: req.body
                });
            }

            const usernameExists = await User.exists(username);
            if (usernameExists) {
                return res.render('auth/register', {
                    title: 'Đăng ký - Paradise Resort & Spa',
                    errors: [{ msg: 'Tên đăng nhập đã được sử dụng' }],
                    formData: req.body
                });
            }

            // Tạo user mới
            const userData = {
                username,
                email,
                password,
                firstName,
                lastName,
                phone,
                address,
                dateOfBirth,
                gender,
                role
            };

            const newUser = await User.create(userData);

            // Set session
            req.session.userId = newUser.id;
            req.session.userRole = newUser.role;
            req.session.username = newUser.username;
            req.session.firstName = newUser.firstName;
            req.session.email = newUser.email;
            req.session.isLoggedIn = true;

            // Set flash message
            req.flash('success_msg', 'Đăng ký thành công! Chào mừng bạn đến với Paradise Resort & Spa.');

            // Redirect based on role
            if (role === 'admin') {
                return res.redirect('/admin');
            } else {
                return res.redirect('/');
            }

        } catch (error) {
            console.error('Register error:', error);
            return res.render('auth/register', {
                title: 'Đăng ký - Paradise Resort & Spa',
                errors: [{ msg: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.' }],
                formData: req.body
            });
        }
    }

    // Đăng xuất
    static async logout(req, res) {
        try {
            // Clear session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                }
                res.redirect('/');
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi đăng xuất'
            });
        }
    }

    // Lấy thông tin user hiện tại
    static async getProfile(req, res) {
        try {
            const userId = req.session.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Chưa đăng nhập'
                });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin user'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy thông tin profile'
            });
        }
    }

    // Cập nhật profile
    static async updateProfile(req, res) {
        try {
            const userId = req.session.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Chưa đăng nhập'
                });
            }

            const updateData = req.body;
            const updatedUser = await User.update(userId, updateData);

            res.json({
                success: true,
                message: 'Cập nhật thông tin thành công',
                data: updatedUser
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi cập nhật profile'
            });
        }
    }

    // Đổi mật khẩu
    static async changePassword(req, res) {
        try {
            const userId = req.session.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Chưa đăng nhập'
                });
            }

            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu mới và xác nhận không khớp'
                });
            }

            // Lấy user để kiểm tra mật khẩu hiện tại
            const user = await User.findByEmailOrUsername(req.session.userEmail);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            // Xác thực mật khẩu hiện tại
            const isValidPassword = await User.validatePassword(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu hiện tại không đúng'
                });
            }

            // Cập nhật mật khẩu mới
            await User.changePassword(userId, newPassword);

            res.json({
                success: true,
                message: 'Đổi mật khẩu thành công'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi đổi mật khẩu'
            });
        }
    }
}

module.exports = AuthController;
