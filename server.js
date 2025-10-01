const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security & parsing middleware
app.use(helmet({
    contentSecurityPolicy: false // Disable for development
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api', limiter);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'resort_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(flash());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Global variables for views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    
    // Get user info from session
    if (req.session && req.session.isLoggedIn && req.session.userId) {
        res.locals.user = {
            id: req.session.userId,
            role: req.session.userRole,
            username: req.session.username,
            firstName: req.session.firstName
        };
    } else {
        res.locals.user = null;
    }
    
    next();
});

// API Routes
const apiRoutes = require('./src/routes');
app.use('/api', apiRoutes);

// Auth Routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/auth', authRoutes);

// Room Routes
const roomRoutes = require('./src/routes/roomRoutes');
app.use('/rooms', roomRoutes);

// Service Routes
const serviceRoutes = require('./src/routes/serviceRoutes');
app.use('/services', serviceRoutes);

// Booking Routes
const bookingRoutes = require('./src/routes/bookingRoutes');
app.use('/booking', bookingRoutes);

// Payment Routes (for MoMo callbacks)
app.get('/payment/momo/qr', require('./src/controllers/bookingController').showMoMoQR);
app.get('/payment/momo/mock', require('./src/controllers/bookingController').showMockMoMoPayment);
app.get('/payment/momo/return', require('./src/controllers/bookingController').handleMoMoReturn);
app.post('/payment/momo/notify', require('./src/controllers/bookingController').handleMoMoNotify);

// Web Routes
app.get('/', (req, res) => {
    res.render('customer/home', {
        title: 'Trang chủ - Paradise Resort & Spa'
    });
});

app.get('/about', (req, res) => {
    res.render('customer/about', {
        title: 'Giới thiệu - Paradise Resort & Spa'
    });
});

app.get('/contact', (req, res) => {
    res.render('customer/contact', {
        title: 'Liên hệ - Paradise Resort & Spa'
    });
});

// Profile Routes
app.get('/profile', (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }
    res.render('customer/profile', {
        title: 'Thông tin cá nhân - Paradise Resort & Spa',
        user: {
            firstName: req.session.firstName,
            lastName: req.session.lastName || '',
            email: req.session.email || '',
            phone: req.session.phone || '',
            address: req.session.address || '',
            dateOfBirth: req.session.dateOfBirth || '',
            gender: req.session.gender || ''
        }
    });
});

// Admin Routes
app.get('/admin', (req, res) => {
    if (!req.session || !req.session.isLoggedIn || req.session.userRole !== 'admin') {
        return res.redirect('/auth/login');
    }
    res.render('admin/dashboard', {
        title: 'Admin Dashboard - Paradise Resort & Spa'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    if (req.originalUrl.startsWith('/api')) {
        // API error response
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    } else {
        // Web error response
        res.status(err.status || 500).render('error', {
            title: 'Lỗi - Paradise Resort & Spa',
            message: err.message || 'Đã xảy ra lỗi, vui lòng thử lại sau.',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }
});

// 404 handler
app.use((req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    } else {
        res.status(404).render('error', {
            title: 'Không tìm thấy trang - Paradise Resort & Spa',
            message: 'Trang bạn tìm kiếm không tồn tại.',
            error: {}
        });
    }
});

// Database connection test
const { testConnection } = require('./src/config/db');

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);
    
    // Test database connection
    try {
        await testConnection();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('💡 Please check your SQL Server configuration in .env file');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
