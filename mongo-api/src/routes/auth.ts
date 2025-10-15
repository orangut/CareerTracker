import express, {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import logger from '../config/logger';

// Import Zod schemas and inferred types
import {User, UserCreateData, UserCreateSchema, UserLoginData, UserLoginSchema, usersCollection} from "../models/user";

const authRouter = express.Router();

// Check if username exists
authRouter.get(`/exists/:username`, async (req, res) => {
    const username = req.params.username

    if (!username) {
        logger.warn('Username check failed: No username provided.');
        return res.status(400).json({error: "username is required"});
    }

    try {
        const existingUser = await usersCollection.findOne({username});
        logger.info(`Username check for '${username}': exists=${!!existingUser}`);
        res.status(200).json({exists: !!existingUser});
    } catch (err) {
        logger.error(`Username check error for '${username}': ${err}`);
        res.status(500).json({exists: false});
    }
});

// Register - Creating a new User
// Expects 'hashedPassword' from an upstream service
authRouter.post("/register", async (req: Request<{}, {}, UserCreateData>, res: Response) => {

    // 1. Zod Validation for username and hashedPassword structure
    const parseResult = UserCreateSchema.safeParse(req.body);

    if (!parseResult.success) {
        logger.warn(`Registration failed due to validation error: ${parseResult.error.issues.map(i => i.message).join(', ')}`);
        return res.status(400).json({success: false, message: 'Validation failed.', errors: parseResult.error.issues});
    }

    const {username, hashedPassword} = parseResult.data;

    try {
        const existingUser = await usersCollection.findOne({username});
        if (existingUser) {
            logger.warn(`Registration failed: Username '${username}' already exists.`);
            return res.status(409).json({success: false, message: 'Username already exists.'});
        }

        // Store the hash directly as provided by the upstream service
        const result = await usersCollection.insertOne({
            username,
            hashedPassword,
        });
        const newUser: User = {
            _id: result.insertedId,
            username,
            hashedPassword
        };

        logger.info(`User '${username}' successfully registered with ID: ${result.insertedId}`);
        // Return only non-sensitive data
        res.status(201).json({success: true, user: {_id: newUser._id, username: newUser.username}});
    } catch (err) {
        logger.error(`Registration error for user '${username}': ${err}`);
        res.status(500).json({success: false, message: 'Error registering user.'});
    }
});

// Route for user login
authRouter.post('/auth', async (req: Request<{}, {}, UserLoginData>, res: Response) => {

    // 1. Zod Validation for username and plaintext password structure
    const parseResult = UserLoginSchema.safeParse(req.body);

    if (!parseResult.success) {
        logger.warn(`Login attempt failed due to validation error: ${parseResult.error.issues.map(i => i.message).join(', ')}`);
        return res.status(400).json({success: false, message: 'Validation failed.', errors: parseResult.error.issues});
    }

    const {username, password} = parseResult.data;

    try {
        const user = await usersCollection.findOne({username});

        // Use a generic error message for security whether the user is not found or the password is wrong
        if (!user) {
            logger.warn(`Login failed for user '${username}': User not found.`);
            return res.status(400).json({success: false, message: 'Invalid credentials.'});
        }

        // The stored hash (from the upstream service) is compared against the client's plaintext password
        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

        if (!isPasswordValid) {
            logger.warn(`Login failed for user '${username}': Invalid password.`);
            return res.status(400).json({success: false, message: 'Invalid credentials.'});
        }

        const userId = user._id.toHexString();

        logger.info(`User '${username}' successfully authenticated. UserId: ${userId}`);
        res.status(200).json({success: true, userId});
    } catch (err) {
        logger.error(`Login error for user '${username}': ${err}`);
        res.status(500).json({success: false, message: 'Error authenticating user.'});
    }
});

export default authRouter;
