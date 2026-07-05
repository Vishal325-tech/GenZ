import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'luxury_secret_gift_movers_key';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Inject decoded payload
      req.user = {
        id: decoded.id,
        role: decoded.role
      };
      
      return next();
    } catch (error) {
      console.error('JWT Token Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }
};

// Role authorization check middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user ? req.user.role : 'none'}) is not authorized to access this resource`
      });
    }
    next();
  };
};
