// src/middleware/authenticateToken.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

interface JwtPayload {
    userId: string;
}

export type Role = 'user' | 'admin';

export interface AuthenticatedRequest extends Request {
    userId?: string;
    role?: Role;
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Get the token directly from the cookie
    const token = req.cookies.token;

    if (token == null) {
        return res.status(401).json({ error: 'Token not provided' });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        logger.error('JWT_SECRET environment variable is not defined.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    try {
        const user = jwt.verify(token, jwtSecret) as JwtPayload;

        if (typeof user === 'object' && user.userId) {
            req.userId = user.userId;
            req.role = 'user' // TODO: handle real roles ('admin' or 'user')
            next();
        } else {
            return res.status(403).json({ error: 'Invalid token payload.' });
        }

    } catch (error: any) {
        // Token is invalid, expired, or tampered with
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

export default authenticateToken;