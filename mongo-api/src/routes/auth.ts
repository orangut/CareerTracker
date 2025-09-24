import express, {Request, Response} from 'express';
import bcrypt from 'bcrypt';

import {usersCollection, User} from "../models/user";

const authRouter = express.Router();

// TODO: add swagger to all routes


// Check if username exists
authRouter.get(`/exists/:username`, async (req, res) => {
    const username = req.params.username

    if (!username) {
        return res.status(400).json({error: "username is required"});
    }

    try {
        const existingUser = await usersCollection.findOne({username});
        res.status(200).json({exists: !!existingUser});
    } catch (err) {
        console.error('Username check error:', err);
        res.status(500).json({exists: false});
    }
});

// Register - Creating a new User
authRouter.post("/register", async (req: Request, res) => {
    const {username, hashedPassword} = req.body;

    if (!username || !hashedPassword) {
        return res.status(400).json({success: false, message: 'Username and hashedPassword are required.'});
    }

    try {
        const existingUser = await usersCollection.findOne({username});
        if (existingUser) {
            return res.status(409).json({success: false, message: 'Username already exists.'});
        }

        const result = await usersCollection.insertOne({
            username,
            hashedPassword,
        });
        const newUser: User = {
            _id: result.insertedId,
            username,
            hashedPassword
        };
        res.status(201).json({success: true, user: newUser});
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({success: false, message: 'Error registering user.'});
    }
});

// Route for user login
authRouter.post('/auth', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }

        const userId = user._id.toHexString();
        res.status(200).json({ success: true, userId });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Error authenticating user.' });
    }
});

export default authRouter;