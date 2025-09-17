import express, {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user'; // Import the User model

dotenv.config();

const authRoutes = express.Router();

// Route for user registration
authRoutes.post('/register', async (req: Request, res: Response) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Use the Sequelize create() method to insert a new user
        await User.create({
            username,
            password: hashedPassword
        });

        res.status(201).send('User registered successfully.');
    } catch (error: any) {
        // Handle a Sequelize unique constraint error if username already exists
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).send('Username already exists.');
        }
        console.error('Registration error:', error);
        res.status(500).send('Error registering user.');
    }
});

// Route for user login
authRoutes.post('/login', async (req: Request, res: Response) => {
    const {username, password} = req.body;

    const tokenExpirationTimeInHours: number = parseInt(process.env.tokenExpirationTimeInHours || '1', 10);

    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    try {
        // Use Sequelize's findOne() method to find a user
        const user = await User.findOne({where: {username}});

        // If no user is found OR the user object doesn't have a password
        if (!user || !user.password) {
            return res.status(400).json({error: 'Invalid credentials'});
        }

        // Compare the submitted password with the hashed password from the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({error: 'Invalid credentials'});
        }

        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET || 'your_jwt_secret', {expiresIn: `${tokenExpirationTimeInHours}h`});

        // Send the token as an HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevents client-side JS from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Protects against CSRF attacks
            maxAge: tokenExpirationTimeInHours * 3600000 // tokenExpirationTimeInHours in milliseconds
        });

        res.json({token});
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).send('Error logging in.');
    }
});

export default authRoutes;