// src/middleware/authenticateToken.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Extend the Express Request interface to include a user property
interface AuthenticatedRequest extends Request {
    user?: string | jwt.JwtPayload;
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ error: 'Token not provided' });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error('JWT_SECRET environment variable is not defined.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    jwt.verify(token, jwtSecret, (error, user) => {
        if (error) {
            // Token is invalid, expired, or tampered with
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }

        // If the token is valid, attach the decoded payload to the request
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
};

export default authenticateToken;