import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Not authorized, no token' });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { id: string };
      
      // Get user from token
      const userId = parseInt(decoded.id);
      req.userId = decoded.id;
      req.user = User.findById(userId);
      
      if (!req.user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }

      // Remove password from user object
      const { password, ...userWithoutPassword } = req.user;
      req.user = userWithoutPassword;

      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
      return;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
