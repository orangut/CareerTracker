import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import userRouter from '../routes/user';

jest.mock('../models/user', () => ({
    usersCollection: {
        insertOne: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        deleteOne: jest.fn(),
    },
    UserCreateSchema: {
        safeParse: jest.fn(),
    },
    UserSchemaUpdate: {
        safeParse: jest.fn(),
    },
}));
jest.mock('../middleware/validateObjectId', () => (req: any, res: any, next: any) => next());
jest.mock('../config/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

import { usersCollection, UserCreateSchema, UserSchemaUpdate } from '../models/user';

const app = express();
app.use(express.json());
app.use('/users', userRouter);

const mockUserId = new ObjectId();
const mockUser = {
    _id: mockUserId,
    username: 'testuser',
    email: 'test@example.com',
};

describe('User Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /users', () => {
        it('should create a user', async () => {
            (UserCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: { ...mockUser, hashedPassword: 'hashed_pw' } });
            (usersCollection.insertOne as jest.Mock).mockResolvedValue({ insertedId: mockUserId });

            const res = await request(app)
                .post('/users')
                .send({ userId: mockUserId, data: { ...mockUser, hashedPassword: 'hashed_pw' } });

            expect(res.statusCode).toBe(201);
            expect(res.body._id).toBeDefined();
            expect(res.body.username).toBe('testuser');
        });

        it('should return 400 on validation error', async () => {
            (UserCreateSchema.safeParse as jest.Mock).mockReturnValue({
                success: false,
                error: { issues: [{ message: 'Validation failed' }] },
            });

            const res = await request(app)
                .post('/users')
                .send({ userId: mockUserId, data: {} });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should return 500 on DB error', async () => {
            (UserCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: { ...mockUser, hashedPassword: 'hashed_pw' } });
            (usersCollection.insertOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .post('/users')
                .send({ userId: mockUserId, data: { ...mockUser, hashedPassword: 'hashed_pw' } });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to create user/);
        });
    });

    describe('GET /users', () => {
        it('should get all users', async () => {
            (usersCollection.find as jest.Mock).mockReturnValue({
                toArray: jest.fn().mockResolvedValue([mockUser]),
            });

            const res = await request(app)
                .get('/users')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].username).toBe('testuser');
        });

        it('should return 500 on DB error', async () => {
            (usersCollection.find as jest.Mock).mockImplementation(() => {
                throw new Error('DB error');
            });

            const res = await request(app)
                .get('/users')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to fetch users/);
        });
    });

    describe('GET /users/:id', () => {
        it('should get a single user by ID', async () => {
            (usersCollection.findOne as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app)
                .get(`/users/${mockUserId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe('testuser');
        });

        it('should return 400 if not found', async () => {
            (usersCollection.findOne as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .get(`/users/${mockUserId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/not found/);
        });

        it('should return 500 on DB error', async () => {
            (usersCollection.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .get(`/users/${mockUserId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to fetch user/);
        });
    });

    describe('GET /users/username/:username', () => {
        it('should get a user by username', async () => {
            (usersCollection.findOne as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app)
                .get('/users/username/testuser')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe('testuser');
        });

        it('should return 400 if username param is missing', async () => {
            const res = await request(app)
                .get('/users/username/')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(404);
        });

        it('should return 404 if not found', async () => {
            (usersCollection.findOne as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .get('/users/username/unknown')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/Not found/);
        });

        it('should return 500 on DB error', async () => {
            (usersCollection.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .get('/users/username/testuser')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to fetch user/);
        });
    });

    describe('PUT /users/:id', () => {
        it('should update a user', async () => {
            (UserSchemaUpdate.safeParse as jest.Mock).mockReturnValue({ success: true, data: { email: 'new@example.com' } });
            (usersCollection.findOneAndUpdate as jest.Mock).mockResolvedValue({ ...mockUser, email: 'new@example.com' });

            const res = await request(app)
                .put(`/users/${mockUserId}`)
                .send({ userId: mockUserId, data: { email: 'new@example.com' }, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.email).toBe('new@example.com');
        });

        it('should return 400 on validation error', async () => {
            (UserSchemaUpdate.safeParse as jest.Mock).mockReturnValue({
                success: false,
                error: { issues: [{ message: 'Validation failed' }] },
            });

            const res = await request(app)
                .put(`/users/${mockUserId}`)
                .send({ userId: mockUserId, data: {}, filters: {} });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should return 404 if not found', async () => {
            (UserSchemaUpdate.safeParse as jest.Mock).mockReturnValue({ success: true, data: { email: 'new@example.com' } });
            (usersCollection.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .put(`/users/${mockUserId}`)
                .send({ userId: mockUserId, data: { email: 'new@example.com' }, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/Not found/);
        });

        it('should return 500 on DB error', async () => {
            (UserSchemaUpdate.safeParse as jest.Mock).mockReturnValue({ success: true, data: { email: 'new@example.com' } });
            (usersCollection.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .put(`/users/${mockUserId}`)
                .send({ userId: mockUserId, data: { email: 'new@example.com' }, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to update user/);
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete a user', async () => {
            (usersCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            const res = await request(app)
                .delete(`/users/${mockUserId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/Deleted successfully/);
        });

        it('should return 404 if not found', async () => {
            (usersCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

            const res = await request(app)
                .delete(`/users/${mockUserId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/Not found/);
        });

        it('should return 500 on DB error', async () => {
            (usersCollection.deleteOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .delete(`/users/${mockUserId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to delete user/);
        });
    });
});