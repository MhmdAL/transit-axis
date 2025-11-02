import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    type: 'user' | 'driver';
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Temporary bypass for development - remove this in production
  req.user = {
    id: '1',
    username: 'dev-user',
    type: 'user'
  };
  
  return next();
};
