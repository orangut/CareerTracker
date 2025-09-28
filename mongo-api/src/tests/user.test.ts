import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import userRouter from '../routes/user';

// --- MOCKING MODULES ---
jest.mock('../models/user', () => ({
    // Mock implementations for MongoDB Collection methods
    usersCollection: {
        insertOne: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
    },
    // Mock UserSchema to control validation success/failure
    UserSchema: {
        safeParse: jest.fn(),
    },
}));

// Re-import the mocked components
import { usersCollection, UserCreateSchema } from '../models/user';

// --- EXPRESS APP SETUP ---
const app = express();
app.use(express.json());
app.use('/user', userRouter);

// --- MOCK DATA (No 'email' field) ---
const mockUserId = new ObjectId();
const mockUser = {
    _id: mockUserId,
    username: 'testuser',
    hashedPassword: 'hashed_password_123',
};
const mockUsers = [
    mockUser,
    { _id: new ObjectId(), username: 'user2', hashedPassword: 'p2' }
];

describe('User Routes (/user)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

// ------------------- POST /user (Create) -------------------
    describe('POST /user', () => {
        // Valid body only contains username and hashedPassword
        const validCreateBody = { username: 'newuser', hashedPassword: 'securepassword' };

        it('should create a new user and return it (without "data" wrapper)', async () => {
            // Mock successful validation
            (UserCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: validCreateBody });
            // Mock the successful insertion result
            (usersCollection.insertOne as jest.Mock).mockResolvedValue({ insertedId: mockUserId });

            const res = await request(app)
                .post('/user')
                .send(validCreateBody);

            expect(res.statusCode).toBe(201);
            // Verify DB insert was called with the validated data (no 'email')
            expect(usersCollection.insertOne).toHaveBeenCalledWith(validCreateBody);

            // Check that the returned object contains the data properties directly, not wrapped in 'data'
            expect(res.body).toHaveProperty('username', 'newuser');
            expect(res.body).not.toHaveProperty('data');
            expect(res.body._id).toBe(mockUserId.toHexString());
        });

        it('should return 400 for invalid user data (validation failure)', async () => {
            // Mock failed validation (e.g., missing hashedPassword)
            (UserCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: false, error: { issues: [{ message: 'Missing required fields' }] } });

            const res = await request(app)
                .post('/user')
                .send({ username: 'short' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

// ------------------- GET /user (Get All) -------------------
    describe('GET /user', () => {
        it('should return all users with ObjectIds converted to strings', async () => {
            (usersCollection.find as jest.Mock).mockReturnValue({
                toArray: jest.fn().mockResolvedValue(mockUsers),
            });

            const res = await request(app)
                .get('/user');

            expect(res.statusCode).toBe(200);
            // Map the mock data to convert ObjectIds to strings for comparison
            const expectedResponse = mockUsers.map(u => ({ ...u, _id: u._id.toHexString() }));
            expect(res.body).toEqual(expectedResponse);
        });
    });

// ------------------- GET /user/:userId (Get by ID) -------------------
    describe('GET /user/:userId', () => {
        it('should return a user by ID', async () => {
            (usersCollection.findOne as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app)
                .get(`/user/${mockUser._id.toHexString()}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe(mockUser.username);
        });
    });

// ------------------- PUT /user/:userId (Update) -------------------
    describe('PUT /user/:userId', () => {
        const updateBody = { username: 'updateduser' }; // Partial update body

        it('should update a user and return the updated object', async () => {
            // Mock validateUserExists to find the user
            (usersCollection.findOne as jest.Mock).mockResolvedValue(mockUser);
            // Mock findOneAndUpdate successful return
            (usersCollection.findOneAndUpdate as jest.Mock).mockResolvedValue({
                value: { ...mockUser, ...updateBody }
            });

            const res = await request(app)
                .put(`/user/${mockUser._id.toHexString()}`)
                .send(updateBody);

            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe('updateduser');
            // Check that hashedPassword is still present (as findOneAndUpdate returns the full document)
            expect(res.body).toHaveProperty('hashedPassword');
        });
    });

// ------------------- DELETE /user/:userId (Delete) -------------------
    describe('DELETE /user/:userId', () => {
        it('should delete a user and return a success message', async () => {
            // Mock validateUserExists to find the user
            (usersCollection.findOne as jest.Mock).mockResolvedValue(mockUser);
            // Mock successful deletion count
            (usersCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            const res = await request(app)
                .delete(`/user/${mockUser._id.toHexString()}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Deleted successfully');
        });
    });
});