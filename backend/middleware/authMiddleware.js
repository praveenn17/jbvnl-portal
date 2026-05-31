const jwt = require('jsonwebtoken');
const User = require('../models/User');

// BUG #9 FIX: Restructured to use if/else to prevent ambiguous double-response
// risk when token extraction succeeds but jwt.verify() throws.
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check token version to handle logout-all devices
      if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
        return res.status(401).json({ message: 'Session expired. Please login again.', code: 'SESSION_EXPIRED' });
      }

      // Check active session ID for Single Active Session feature
      if (decoded.activeSessionId !== user.activeSessionId) {
        return res.status(401).json({ 
          message: 'Your account was logged in from another browser. This session has been terminated.',
          code: 'SESSION_TERMINATED' 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[AUTH] Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Allows access to admin AND manager roles.
const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Admin or Manager role required.' });
  }
};

module.exports = { protect, admin };
