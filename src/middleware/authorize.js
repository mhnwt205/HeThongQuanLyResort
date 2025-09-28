/**
 * Middleware phân quyền theo vai trò
 * @param {...string} roles - Các vai trò được phép truy cập
 * @returns {Function} Middleware function
 */
module.exports = function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. User role not found.' 
      });
    }
    
    if (!roles.length || roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Insufficient permissions.' 
    });
  };
};

