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
    const userId = req.authContext?.userId;
    const data = req.authContext?.data;

    try {
        // Validation checks for username and hashedPassword
        const parseResult = UserCreateSchema.safeParse(data);
        if (!parseResult.success) {
            logger.warn(`Failed to create user due to validation error: ${parseResult.error}. UserId: ${userId}`);
            return res.status(400).json({error: parseResult.error});
        }

        // Use the validated/parsed data for insertion
        const {hashedPassword, ...userData}: UserCreateData = parseResult.data

        const result = await usersCollection.insertOne({...userData, hashedPassword});

        const newUser: Omit<User, 'hashedPassword'> = {
            _id: result.insertedId,
            ...userData, // Spread the user data directly
        };

        logger.info(`Successfully created new user with ID: ${result.insertedId}. UserId: ${userId}`);
        // SECURITY NOTE: DO NOT return hashedPassword in a real API
        res.status(201).json(newUser);
    } catch (err) {
        logger.error(`Error creating user: ${err}. UserId: ${userId}`);
        res.status(500).json({error: "Failed to create user"});
    }
});

// Get all users
userRouter.get("/", async (req: GetUserReq, res) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;

    try {
        const users = await usersCollection.find(filters || {}).toArray();
        // Log successful fetch of all users
        logger.info(`Successfully fetched all users. UserId: ${userId}`);
        res.json(users);
    } catch (err) {
        // Log server-side errors
        logger.error(`Error fetching all users: ${err}. UserId: ${userId}`);
        res.status(500).json({error: "Failed to fetch users"});
    }
});

// Get user by ID
userRouter.get("/:id", validateObjectId, async (req: GetUserReq, res) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;

    const {id} = req.params
    const userIdObject = new ObjectId(id as string);

    try {
        const user = await usersCollection.findOne({...filters, _id: userIdObject});

        if (!user) {
            logger.warn(`User ${id} not found or unauthorized. UserId: ${userId}.`);
            return res.status(404).json({error: `User ${id} not found or unauthorized.`});
        }

        logger.info(`Successfully fetched user with ID: ${user._id}. UserId: ${userId}`);
        res.json(user);
    } catch (err) {
        // Log server-side errors
        logger.error(`Error fetching user by ID: ${err}`);
        res.status(500).json({error: "Failed to fetch user"});
    }
});

// Get user by username
userRouter.get("/username/:username", async (req: GetUserReq, res) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;

    const {username} = req.params;

    if (!username) {
        // Log bad requests
        logger.warn(`Request to get user by username failed: username is missing. UserId: ${userId}`);
        return res.status(400).json({error: "username is required"});
    }

    try {
        const user = await usersCollection.findOne({...filters, username});
        if (!user) {
            // Log not found errors
            logger.warn(`User with username '${username}' not found. UserId: ${userId}`);
            return res.status(404).json({error: "Not found"});
        }
        // Log successful fetch of a user by username
        logger.info(`Successfully fetched user with username: '${username}'. UserId: ${userId}`);
        res.json(user);
    } catch (err) {
        // Log server-side errors
        logger.error(`Error fetching user by username: ${err}. UserId: ${userId}`);
        res.status(500).json({error: "Failed to fetch user"});
    }
});

// Update user
userRouter.put("/:id", validateObjectId, async (req: UpdateUserReq, res) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;
    const data = req.authContext?.data;

    const {id} = req.params;
    const userIdObject = new ObjectId(id as string);

    try {
        const parseResult = UserSchemaUpdate.safeParse(data);
        if (!parseResult.success) {
            // Log validation errors
            logger.warn(`Failed to update user with ID ${id} due to validation error: ${parseResult.error}. UserId: ${userId}`);
            return res.status(400).json({error: parseResult.error});
        }

        const updateFields = parseResult.data;

        const updatedUser = await usersCollection.findOneAndUpdate(
            {...filters, _id: userIdObject},
            {$set: updateFields},
            {returnDocument: 'after'}
        ) as User | undefined;

        if (!updatedUser) {
            // Log not found errors
            logger.warn(`User with ID ${id} not found for update. UserId: ${userId}`);
            return res.status(404).json({error: "Not found"});
        }
        // Log successful update
        logger.info(`Successfully updated user with ID: ${id}. UserId: ${userId}`);
        res.json(updatedUser);
    } catch (err) {
        // Log server-side errors
        logger.error(`Error updating user with ID ${userId}: ${err}. UserId: ${userId}`);
        res.status(500).json({error: "Failed to update user"});
    }
});

// Delete user
userRouter.delete("/:id", validateObjectId, async (req: GetDeleteReq, res) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;

    const {id} = req.params;
    const userIdObject = new ObjectId(id as string);

    try {
        // FIXME: The filter is not working where i
        const temp = await usersCollection.findOne({...filters, _id: userIdObject})
        const result = await usersCollection.deleteOne({...filters, _id: userIdObject});
        if (result.deletedCount === 0) {
            // Log not found errors
            logger.warn(`User with ID ${id} not found for deletion. UserId: ${userId}`);
            return res.status(404).json({error: "Not found"});
        }
        // Log successful deletion
        logger.info(`Successfully deleted user with ID: ${id}. UserId: ${userId}`);
        res.json({message: "Deleted successfully"});
    } catch (err) {
        // Log server-side errors
        logger.error(`Error deleting user with ID ${id}: ${err}`);
        res.status(500).json({error: "Failed to delete user."});
    }
});

export default userRouter;