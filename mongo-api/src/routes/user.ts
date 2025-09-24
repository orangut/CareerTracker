import {Router} from "express";
import {ObjectId} from "mongodb";
import {UserSchema, usersCollection} from "../models/user";
import {ValidatedUserExistsRequest, validateUserExists} from "../middleware/validateUser";

const userRouter = Router();


// TODO: restricted role could create a new user
// Create user
userRouter.post("/", async (req, res) => {
    try {
        const parseResult = UserSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({error: parseResult.error});
        }
        const result = await usersCollection.insertOne(req.body);

        // TODO: fix the swagger method to return the complete object instead of just id
        const newUser = {
            _id: result.insertedId,
            ...parseResult
        };

        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to create user"});
    }
});

// TODO: restricted role can get all the users
// Get all users
userRouter.get("/", async (_req: ValidatedUserExistsRequest, res) => {
    try {
        const users = await usersCollection.find().toArray();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to fetch users"});
    }
});

// Get user by ID
userRouter.get("/:userId", validateUserExists, async (req: ValidatedUserExistsRequest, res) => {
    try {
        const id = req.validatedUser?._id;
        const user = await usersCollection.findOne({_id: new ObjectId(id)});
        if (!user) return res.status(404).json({error: "Not found"});
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to fetch user"});
    }
});


// Get user by ID
userRouter.get("/username/:username", validateUserExists, async (req, res) => {
    const username = req.params.username

    if (!username) {
        return res.status(400).json({error: "username is required"});
    }

    try {
        const user = await usersCollection.findOne({username});
        if (!user) return res.status(404).json({error: "Not found"});
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to fetch user"});
    }
});

// Update user
userRouter.put("/:userId", validateUserExists, async (req: ValidatedUserExistsRequest, res) => {
    try {
        const id = req.validatedUser?._id;
        const parseResult = UserSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({error: parseResult.error});
        }
        const result = await usersCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: req.body}
        );
        if (result.matchedCount === 0) return res.status(404).json({error: "Not found"});
        res.json({message: "Updated successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to update user"});
    }
});

// Delete user
userRouter.delete("/:userId", validateUserExists, async (req: ValidatedUserExistsRequest, res) => {
    try {
        const id = req.validatedUser?._id;
        const result = await usersCollection.deleteOne({_id: new ObjectId(id)});
        if (result.deletedCount === 0) return res.status(404).json({error: "Not found"});
        res.json({message: "Deleted successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to delete user"});
    }
});

export default userRouter;
