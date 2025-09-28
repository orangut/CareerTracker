import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import authRouter from '../routes/auth';

jest.mock('../models/user', () => ({
    usersCollection: {
        findOne: jest.fn(),
        insertOne: jest.fn(),
    },
    UserCreateSchema: {
        safeParse: jest.fn(),
    },
    UserLoginSchema: {
        safeParse: jest.fn(),
    },
}));
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));
jest.mock('../config/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

import { usersCollection, UserCreateSchema, UserLoginSchema } from '../models/user';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

const mockUserId = new ObjectId();
const mockUser = {
    _id: mockUserId,
    username: 'testuser',
    hashedPassword: 'hashed_pw',
};

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /auth/exists/:username', () => {
        it('should return exists=true if user exists', async () => {
            (usersCollection.findOne as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app).get('/auth/exists/testuser');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ exists: true });
        });

        it('should return exists=false if user does not exist', async () => {
            (usersCollection.findOne as jest.Mock).mockResolvedValue(null);

            const res = await request(app).get('/auth/exists/unknown');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ exists: false });
        });

        it('should return 400 if username param is missing', async () => {
            const res = await request(app).get('/auth/exists/');
            expect(res.statusCode).toBe(404);
        });

        it('should return 500 on DB error', async () => {
            (usersCollection.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app).get('/auth/exists/testuser');
            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ exists: false });
        });
    });

    describe('POST /auth/register', () => {
        const validBody = { username: 'newuser', hashedPassword: 'hashed_pw' };

        it('should register a new user', async () => {
            (UserCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: validBody });
            (usersCollection.findOne as jest.Mock).mockResolvedValue(null);
            (usersCollection.insertOne as jest.Mock).mockResolvedValue({ insertedId: mockUserId });

            const res = await request(app).post('/auth/register').send(validBody);
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toEqual({ _id: mockUserId, username: 'newuser' });
        });

        it('should return 409 if username already exists', async () => {
            (UserCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: validBody });
            (usersCollection.findOne as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app).post('/auth/register').send(validBody);
            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/already exists/);
        });

        it('should return 400 on validation error', async () => {
            (UserCreateSchema.safeParse as jest.Mock).mockReturnValue({
                success: false,
                error: { issues: [{ message: 'Validation failed' }] },
            });

            const res = await request(app).post('/auth/register').send({ username: 'bad' });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });

        it('should return 500 on DB error', async () => {
            (UserCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: validBody });
            (usersCollection.findOne as jest.Mock).mockResolvedValue(null);
            (usersCollection.insertOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app).post('/auth/register').send(validBody);
            expect(res.statusCode).toBe(500);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /auth/auth', () => {
        const validLogin = { username: 'testuser', password: 'plain_pw' };

        it('should authenticate user with valid credentials', async () => {
            (UserLoginSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: validLogin });
            (usersCollection.findOne as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const res = await request(app).post('/auth/auth').send(validLogin);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.userId).toBe(mockUserId.toHexString());
        });

        it('should return 400 if user not found', async () => {
            (UserLoginSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: validLogin });
            (usersCollection.findOne as jest.Mock).mockResolvedValue(null);

            const res = await request(app).post('/auth/auth').send(validLogin);
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Invalid credentials/);
        });

        it('should return 400 if password is invalid', async () => {
            (UserLoginSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: validLogin });
            (usersCollection.findOne as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const res = await request(app).post('/auth/auth').send(validLogin);
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Invalid credentials/);
        });

        it('should return 400 on validation error', async () => {
            (UserLoginSchema.safeParse as jest.Mock).mockReturnValue({
                success: false,
                error: { issues: [{ message: 'Validation failed' }] },
            });

            const res = await request(app).post('/auth/auth').send({ username: 'bad' });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });

        it('should return 500 on DB error', async () => {
            (UserLoginSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: validLogin });
            (usersCollection.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app).post('/auth/auth').send(validLogin);
            expect(res.statusCode).toBe(500);
            expect(res.body.success).toBe(false);
        });
    });
});