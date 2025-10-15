import { Request } from 'express';

// Extend the Request object to include the userId from the JWT payload
export interface AuthenticatedRequest extends Request {
    userId?: string;
}
