import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import stageRouter from '../routes/stage';

jest.mock('../models/stage', () => ({
    stagesCollection: {
        insertOne: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        deleteOne: jest.fn(),
    },
    StageCreateSchema: {
        safeParse: jest.fn(),
    },
    StageUpdateSchema: {
        safeParse: jest.fn(),
    },
}));
jest.mock('../middleware/validateObjectId', () => (req: any, res: any, next: any) => next());
jest.mock('../config/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

import { stagesCollection, StageCreateSchema, StageUpdateSchema } from '../models/stage';

const app = express();
app.use(express.json());
app.use('/stages', stageRouter);

const mockUserId = new ObjectId();
const mockStageId = new ObjectId();
const mockStage = {
    _id: mockStageId,
    userId: mockUserId,
    name: 'Interview',
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe('Stage Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /stages', () => {
        it('should create a stage', async () => {
            (StageCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: mockStage });
            (stagesCollection.insertOne as jest.Mock).mockResolvedValue({ insertedId: mockStageId });

            const res = await request(app)
                .post('/stages')
                .send({ userId: mockUserId, data: mockStage });

            expect(res.statusCode).toBe(201);
            expect(res.body._id).toBeDefined();
            expect(res.body.name).toBe('Interview');
        });

        it('should return 400 on validation error', async () => {
            (StageCreateSchema.safeParse as jest.Mock).mockReturnValue({
                success: false,
                error: { issues: [{ message: 'Validation failed' }] },
            });

            const res = await request(app)
                .post('/stages')
                .send({ userId: mockUserId, data: {} });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should return 500 on DB error', async () => {
            (StageCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: mockStage });
            (stagesCollection.insertOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .post('/stages')
                .send({ userId: mockUserId, data: mockStage });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to create stage/);
        });
    });

    describe('GET /stages', () => {
        it('should get all stages', async () => {
            (stagesCollection.find as jest.Mock).mockReturnValue({
                toArray: jest.fn().mockResolvedValue([mockStage]),
            });

            const res = await request(app)
                .get('/stages')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].name).toBe('Interview');
        });

        it('should return 500 on DB error', async () => {
            (stagesCollection.find as jest.Mock).mockImplementation(() => {
                throw new Error('DB error');
            });

            const res = await request(app)
                .get('/stages')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to fetch stages/);
        });
    });

    describe('GET /stages/:id', () => {
        it('should get a single stage', async () => {
            (stagesCollection.findOne as jest.Mock).mockResolvedValue(mockStage);

            const res = await request(app)
                .get(`/stages/${mockStageId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Interview');
        });

        it('should return 404 if not found', async () => {
            (stagesCollection.findOne as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .get(`/stages/${mockStageId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/not found/);
        });

        it('should return 500 on DB error', async () => {
            (stagesCollection.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .get(`/stages/${mockStageId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to fetch stage/);
        });
    });

    describe('PUT /stages/:id', () => {
        it('should update a stage', async () => {
            (StageUpdateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: { name: 'Offer' } });
            (stagesCollection.findOneAndUpdate as jest.Mock).mockResolvedValue({ ...mockStage, name: 'Offer' });

            const res = await request(app)
                .put(`/stages/${mockStageId}`)
                .send({ userId: mockUserId, data: { name: 'Offer' }, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Offer');
        });

        it('should return 400 on validation error', async () => {
            (StageUpdateSchema.safeParse as jest.Mock).mockReturnValue({
                success: false,
                error: { issues: [{ message: 'Validation failed' }] },
            });

            const res = await request(app)
                .put(`/stages/${mockStageId}`)
                .send({ userId: mockUserId, data: {}, filters: {} });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should return 404 if not found', async () => {
            (StageUpdateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: { name: 'Offer' } });
            (stagesCollection.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .put(`/stages/${mockStageId}`)
                .send({ userId: mockUserId, data: { name: 'Offer' }, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/Not found/);
        });

        it('should return 500 on DB error', async () => {
            (StageUpdateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: { name: 'Offer' } });
            (stagesCollection.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .put(`/stages/${mockStageId}`)
                .send({ userId: mockUserId, data: { name: 'Offer' }, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to update stage/);
        });
    });

    describe('DELETE /stages/:id', () => {
        it('should delete a stage', async () => {
            (stagesCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            const res = await request(app)
                .delete(`/stages/${mockStageId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/Deleted successfully/);
        });

        it('should return 404 if not found', async () => {
            (stagesCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

            const res = await request(app)
                .delete(`/stages/${mockStageId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/Not found/);
        });

        it('should return 500 on DB error', async () => {
            (stagesCollection.deleteOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .delete(`/stages/${mockStageId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to delete stage/);
        });
    });
});