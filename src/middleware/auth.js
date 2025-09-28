const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        // Kiểm tra session trước
        if (req.session && req.session.isLoggedIn && req.session.userId) {
            req.user = {
                id: req.session.userId,
                role: req.session.userRole
            };
            return next();
        }

        // Fallback: kiểm tra JWT token từ header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            // Nếu là web request, redirect đến login
            if (req.originalUrl && !req.originalUrl.startsWith('/api')) {
                return res.redirect('/auth/login');
            }
            
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // Nếu là web request, redirect đến login
        if (req.originalUrl && !req.originalUrl.startsWith('/api')) {
            return res.redirect('/auth/login');
        }
        
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

// Middleware kiểm tra role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please login first.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

// Middleware kiểm tra admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        if (req.originalUrl && !req.originalUrl.startsWith('/api')) {
            return res.redirect('/auth/login');
        }
        
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// Middleware kiểm tra customer
const requireCustomer = (req, res, next) => {
    if (!req.user || req.user.role !== 'customer') {
        if (req.originalUrl && !req.originalUrl.startsWith('/api')) {
            return res.redirect('/auth/login');
        }
        
        return res.status(403).json({
            success: false,
            message: 'Access denied. Customer privileges required.'
        });
    }
    next();
};

module.exports = { 
    authenticate, 
    authorize, 
    requireAdmin, 
    requireCustomer 
};