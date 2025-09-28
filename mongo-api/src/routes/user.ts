import {Router} from "express";
import {ObjectId} from "mongodb";
import {
    User,
    UserCreateData,
    UserCreateSchema,
    UserSchemaUpdate,
    usersCollection,
    UserUpdateData
} from "../models/user";
import logger from '../config/logger';
import {validateObjectId} from "../middleware/validateObjectId";
import {MyRequestType} from '../types'

const userRouter = Router();


type CreateUserReq = MyRequestType<User, UserCreateData>;
type GetUserReq = MyRequestType<User>;
type UpdateUserReq = MyRequestType<User, UserUpdateData>;
type GetDeleteReq = MyRequestType<User>;


// Create user
userRouter.post("/", async (req: CreateUserReq, res) => {
    try {
        // Validation checks for username and hashedPassword
        const parseResult = UserCreateSchema.safeParse(req.body.data);
        if (!parseResult.success) {
            logger.warn(`Failed to create user due to validation error: ${parseResult.error}. UserId: ${req.body.userId}`);
            return res.status(400).json({error: parseResult.error});
        }

        // Use the validated/parsed data for insertion
        const {hashedPassword, ...userData}: UserCreateData = parseResult.data

        const result = await usersCollection.insertOne({...userData, hashedPassword});

        const newUser: Omit<User, 'hashedPassword'> = {
            _id: result.insertedId,
            ...userData, // Spread the user data directly
        };

        logger.info(`Successfully created new user with ID: ${result.insertedId}. UserId: ${req.body.userId}`);
        // SECURITY NOTE: DO NOT return hashedPassword in a real API
        res.status(201).json(newUser);
    } catch (err) {
        logger.error(`Error creating user: ${err}. UserId: ${req.body.userId}`);
        res.status(500).json({error: "Failed to create user"});
    }
});

// Get all users
userRouter.get("/", async (req: GetUserReq, res) => {
    try {
        const users = await usersCollection.find(req.body.filters || {}).toArray();
        // Log successful fetch of all users
        logger.info(`Successfully fetched all users. UserId: ${req.body.userId}`);
        res.json(users);
    } catch (err) {
        // Log server-side errors
        logger.error(`Error fetching all users: ${err}. UserId: ${req.body.userId}`);
        res.status(500).json({error: "Failed to fetch users"});
    }
});

// Get user by ID
userRouter.get("/:id", validateObjectId, async (req: GetUserReq, res) => {
    try {
        const idObject = new ObjectId(req.params.id as string);
        const user = await usersCollection.findOne({...req.body.filters, _id: idObject});

        if (!user) {
            logger.warn(`User ${req.params.id} not found or unauthorized. UserId: ${req.body.userId}.`);
            return res.status(400).json({error: `User ${req.params.id} not found or unauthorized.`});
        }

        logger.info(`Successfully fetched user with ID: ${user._id}. UserId: ${req.body.userId}`);
        res.json(user);
    } catch (err) {
        // Log server-side errors
        logger.error(`Error fetching user by ID: ${err}`);
        res.status(500).json({error: "Failed to fetch user"});
    }
});

// Get user by username
userRouter.get("/username/:username", async (req: GetUserReq, res) => {
    const {username} = req.params;

    if (!username) {
        // Log bad requests
        logger.warn(`Request to get user by username failed: username is missing. UserId: ${req.body.userId}`);
        return res.status(400).json({error: "username is required"});
    }

    try {
        const user = await usersCollection.findOne({...req.body.filters, username});
        if (!user) {
            // Log not found errors
            logger.warn(`User with username '${username}' not found. UserId: ${req.body.userId}`);
            return res.status(404).json({error: "Not found"});
        }
        // Log successful fetch of a user by username
        logger.info(`Successfully fetched user with username: '${username}'. UserId: ${req.body.userId}`);
        res.json(user);
    } catch (err) {
        // Log server-side errors
        logger.error(`Error fetching user by username: ${err}. UserId: ${req.body.userId}`);
        res.status(500).json({error: "Failed to fetch user"});
    }
});

// Update user
userRouter.put("/:id", validateObjectId, async (req: UpdateUserReq, res) => {
    try {
        const idObject = new ObjectId(req.params.id as string);
        const parseResult = UserSchemaUpdate.safeParse(req.body.data);
        if (!parseResult.success) {
            // Log validation errors
            logger.warn(`Failed to update user with ID ${req.params.id} due to validation error: ${parseResult.error}. UserId: ${req.body.userId}`);
            return res.status(400).json({error: parseResult.error});
        }

        const updateFields = parseResult.data;

        const updatedUser = await usersCollection.findOneAndUpdate(
            {...req.body.filters, _id: idObject},
            {$set: updateFields},
            {returnDocument: 'after'}
        ) as User | undefined;

        if (!updatedUser) {
            // Log not found errors
            logger.warn(`User with ID ${req.params.id} not found for update. UserId: ${req.body.userId}`);
            return res.status(404).json({error: "Not found"});
        }
        // Log successful update
        logger.info(`Successfully updated user with ID: ${req.params.id}. UserId: ${req.body.userId}`);
        res.json(updatedUser);
    } catch (err) {
        // Log server-side errors
        logger.error(`Error updating user with ID ${req.params.userId}: ${err}. UserId: ${req.body.userId}`);
        res.status(500).json({error: "Failed to update user"});
    }
});

// Delete user
userRouter.delete("/:id", validateObjectId, async (req: GetDeleteReq, res) => {
    try {
        const idObject = new ObjectId(req.params.id as string);
        const result = await usersCollection.deleteOne({...req.body.filters, _id: idObject});
        if (result.deletedCount === 0) {
            // Log not found errors
            logger.warn(`User with ID ${req.params.id} not found for deletion. UserId: ${req.body.userId}`);
            return res.status(404).json({error: "Not found"});
        }
        // Log successful deletion
        logger.info(`Successfully deleted user with ID: ${req.params.id}. UserId: ${req.body.userId}`);
        res.json({message: "Deleted successfully"});
    } catch (err) {
        // Log server-side errors
        logger.error(`Error deleting user with ID ${req.params.id}: ${err}`);
        res.status(500).json({error: "Failed to delete user."});
    }
});

export default userRouter;