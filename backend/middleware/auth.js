import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Fetch user from DB to get latest info
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    req.user.userData = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to access this resource.' });
    }

    next();
  };
};

export const requireApprovedAccount = (req, res, next) => {
  if (!req.user.userData.isApproved) {
    return res.status(403).json({ message: 'Your account is not approved yet.' });
  }
  next();
};

export const requireVerifiedEmail = (req, res, next) => {
  if (!req.user.userData.isVerified) {
    return res.status(403).json({ message: 'Please verify your email first.' });
  }
  next();
};

export const requirePremium = (req, res, next) => {
  if (!req.user.userData.isPremiumActive) {
    return res.status(403).json({ message: 'This feature requires a premium subscription.' });
  }
  next();
};
