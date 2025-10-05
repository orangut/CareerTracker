import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import notificationRuleRouter from '../routes/notificationRule';

jest.mock('../models/notificationRule', () => ({
    notificationRulesCollection: {
        insertOne: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        deleteOne: jest.fn(),
    },
    NotificationRuleCreateSchema: {
        safeParse: jest.fn(),
    },
    NotificationRuleUpdateSchema: {
        safeParse: jest.fn(),
    },
}));
jest.mock('../middleware/validateObjectId', () => (req: any, res: any, next: any) => next());
jest.mock('../config/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

import { notificationRulesCollection, NotificationRuleCreateSchema, NotificationRuleUpdateSchema } from '../models/notificationRule';

const app = express();
app.use(express.json());
app.use('/notificationRules', notificationRuleRouter);

const mockUserId = new ObjectId();
const mockRuleId = new ObjectId();
const mockRule = {
    _id: mockRuleId,
    userId: mockUserId,
    offsetMs: 3600000,
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe('NotificationRule Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /notificationRules', () => {
        it('should create a notification rule', async () => {
            (NotificationRuleCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: mockRule });
            (notificationRulesCollection.insertOne as jest.Mock).mockResolvedValue({ insertedId: mockRuleId });

            const res = await request(app)
                .post('/notificationRules')
                .send({ userId: mockUserId, data: mockRule });

            expect(res.statusCode).toBe(201);
            expect(res.body._id).toBeDefined();
            expect(res.body.offsetMs).toBe(3600000);
        });

        it('should return 400 on validation error', async () => {
            (NotificationRuleCreateSchema.safeParse as jest.Mock).mockReturnValue({
                success: false,
                error: { issues: [{ message: 'Validation failed' }] },
            });

            const res = await request(app)
                .post('/notificationRules')
                .send({ userId: mockUserId, data: {} });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should return 500 on DB error', async () => {
            (NotificationRuleCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: mockRule });
            (notificationRulesCollection.insertOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .post('/notificationRules')
                .send({ userId: mockUserId, data: mockRule });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to create notification rule/);
        });
    });

    describe('GET /notificationRules', () => {
        it('should get all notification rules', async () => {
            (notificationRulesCollection.find as jest.Mock).mockReturnValue({
                toArray: jest.fn().mockResolvedValue([mockRule]),
            });

            const res = await request(app)
                .get('/notificationRules')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].offsetMs).toBe(3600000);
        });

        it('should return 500 on DB error', async () => {
            (notificationRulesCollection.find as jest.Mock).mockImplementation(() => {
                throw new Error('DB error');
            });

            const res = await request(app)
                .get('/notificationRules')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to fetch notification rules/);
        });
    });

    describe('GET /notificationRules/:id', () => {
        it('should get a single notification rule', async () => {
            (notificationRulesCollection.findOne as jest.Mock).mockResolvedValue(mockRule);

            const res = await request(app)
                .get(`/notificationRules/${mockRuleId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.offsetMs).toBe(3600000);
        });

        it('should return 404 if not found', async () => {
            (notificationRulesCollection.findOne as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .get(`/notificationRules/${mockRuleId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/not found/);
        });

        it('should return 500 on DB error', async () => {
            (notificationRulesCollection.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .get(`/notificationRules/${mockRuleId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to fetch notification rule/);
        });
    });

    describe('PUT /notificationRules/:id', () => {
        it('should update a notification rule', async () => {
            (NotificationRuleUpdateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: { offsetMs: 7200000 } });
            (notificationRulesCollection.findOneAndUpdate as jest.Mock).mockResolvedValue({ ...mockRule, offsetMs: 7200000 });

            const res = await request(app)
                .put(`/notificationRules/${mockRuleId}`)
                .send({ userId: mockUserId, data: { offsetMs: 7200000 }, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.offsetMs).toBe(7200000);
        });

        it('should return 400 on validation error', async () => {
            (NotificationRuleUpdateSchema.safeParse as jest.Mock).mockReturnValue({
                success: false,
                error: { issues: [{ message: 'Validation failed' }] },
            });

            const res = await request(app)
                .put(`/notificationRules/${mockRuleId}`)
                .send({ userId: mockUserId, data: {}, filters: {} });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should return 404 if not found', async () => {
            (NotificationRuleUpdateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: { offsetMs: 7200000 } });
            (notificationRulesCollection.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .put(`/notificationRules/${mockRuleId}`)
                .send({ userId: mockUserId, data: { offsetMs: 7200000 }, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/Not found/);
        });

        it('should return 500 on DB error', async () => {
            (NotificationRuleUpdateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: { offsetMs: 7200000 } });
            (notificationRulesCollection.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .put(`/notificationRules/${mockRuleId}`)
                .send({ userId: mockUserId, data: { offsetMs: 7200000 }, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to update notification rule/);
        });
    });

    describe('DELETE /notificationRules/:id', () => {
        it('should delete a notification rule', async () => {
            (notificationRulesCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            const res = await request(app)
                .delete(`/notificationRules/${mockRuleId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/Deleted successfully/);
        });

        it('should return 404 if not found', async () => {
            (notificationRulesCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

            const res = await request(app)
                .delete(`/notificationRules/${mockRuleId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/Not found/);
        });

        it('should return 500 on DB error', async () => {
            (notificationRulesCollection.deleteOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .delete(`/notificationRules/${mockRuleId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to delete notification rule/);
        });
    });
});