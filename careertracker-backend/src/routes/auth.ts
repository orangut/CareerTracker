import express, {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from '../config/logger';

import {User, dbClient} from "../config/dbClient";

dotenv.config();
const tokenExpirationTimeInHours: number = parseInt(process.env.tokenExpirationTimeInHours || '1', 10);

const authRouter = express.Router();

// Route for user registration
authRouter.post('/register', async (req: Request, res: Response) => {
    const {username, password} = req.body;

    if (!username || !password) {
        logger.warn('Registration attempt failed: Username or password missing.');
        return res.status(400).send('Username and password are required.');
    }

    try {
        // Check if user already exists
        const existingUser = await dbClient.auth.isUserExists(username);
        if (existingUser) {
            logger.warn(`Registration attempt failed: Username '${username}' already exists.`);
            return res.status(409).send('Username already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Use dbApiClient to send the request to the DB API
        const newUser: User | null = await dbClient.auth.register(username, hashedPassword);

        const token = jwt.sign({userId: newUser?._id}, process.env.JWT_SECRET || 'your_jwt_secret', {expiresIn: `${tokenExpirationTimeInHours}h`});

        // Send the token as an HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevents client-side JS from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Protects against CSRF attacks
            maxAge: tokenExpirationTimeInHours * 3600000 // tokenExpirationTimeInHours in milliseconds
        });

        logger.info(`User successfully registered: '${username}'`);
        res.status(201).json({token});
    } catch (error: any) {
        // Handle a Sequelize unique constraint error if username already exists
        if (error.name === 'SequelizeUniqueConstraintError') {
            logger.warn(`Registration attempt failed due to unique constraint error for username '${username}'.`, { error });
            return res.status(409).send('Username already exists.');
        }
        logger.error(`Registration error for username '${username}'.`, { error });
        res.status(500).send('Error registering user.');
    }
});

// Route for user login
authRouter.post('/login', async (req: Request, res: Response) => {
    const {username, password} = req.body;

    if (!username || !password) {
        logger.warn('Login attempt failed: Username or password missing.');
        return res.status(400).send('Username and password are required.');
    }

    try {
        // Use dbApiClient to authenticate the user on the DB API
        const userId = await dbClient.auth.login(username, password);

        if (!userId) {
            logger.warn(`Login attempt failed: Invalid credentials for username '${username}'.`);
            return res.status(400).json({error: 'Invalid credentials'});
        }

        const token = jwt.sign({userId: userId}, process.env.JWT_SECRET || 'your_jwt_secret', {expiresIn: `${tokenExpirationTimeInHours}h`});

        // Send the token as an HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevents client-side JS from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Protects against CSRF attacks
            maxAge: tokenExpirationTimeInHours * 3600000 // tokenExpirationTimeInHours in milliseconds
        });

        logger.info(`User successfully logged in: '${username}'`);
        res.json({token});
    } catch (error: any) {
        logger.error(`Login error for username '${username}'.`, { error });
        res.status(500).send('Error logging in.');
    }
});

export default authRouter;
