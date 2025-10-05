import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import jobApplicationRoute from '../routes/jobApplication';

jest.mock('../models/jobApplication', () => ({
    jobApplicationsCollection: {
        insertOne: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        deleteOne: jest.fn(),
    },
    JobApplicationCreateSchema: {
        safeParse: jest.fn(),
    },
    JobApplicationUpdateSchema: {
        safeParse: jest.fn(),
    },
}));
jest.mock('../models/stage', () => ({
    stagesCollection: {
        findOne: jest.fn(),
        deleteMany: jest.fn(),
    },
}));
jest.mock('../middleware/validateObjectId', () => (req: any, res: any, next: any) => next());
jest.mock('../config/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

import { jobApplicationsCollection, JobApplicationCreateSchema, JobApplicationUpdateSchema } from '../models/jobApplication';
import { stagesCollection } from '../models/stage';

const app = express();
app.use(express.json());
app.use('/jobApplications', jobApplicationRoute);

const mockUserId = new ObjectId();
const mockJobId = new ObjectId();
const mockApp = {
    _id: mockJobId,
    company: 'TestCorp',
    position: 'Engineer',
    lastStageId: new ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
};
const mockStage = { _id: mockApp.lastStageId, name: 'Interview' };

describe('JobApplication Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /jobApplications', () => {
        it('should create a job application', async () => {
            (JobApplicationCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: mockApp });
            (jobApplicationsCollection.insertOne as jest.Mock).mockResolvedValue({ insertedId: mockJobId });

            const res = await request(app)
                .post('/jobApplications')
                .send({ userId: mockUserId, data: mockApp });

            expect(res.statusCode).toBe(201);
            expect(res.body._id).toBeDefined();
            expect(res.body.company).toBe('TestCorp');
        });

        it('should return 400 on validation error', async () => {
            (JobApplicationCreateSchema.safeParse as jest.Mock).mockReturnValue({
                success: false,
                error: { issues: [{ message: 'Validation failed' }] },
            });

            const res = await request(app)
                .post('/jobApplications')
                .send({ userId: mockUserId, data: {} });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should return 500 on DB error', async () => {
            (JobApplicationCreateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: mockApp });
            (jobApplicationsCollection.insertOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .post('/jobApplications')
                .send({ userId: mockUserId, data: mockApp });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to create job application/);
        });
    });

    describe('GET /jobApplications', () => {
        it('should get all job applications', async () => {
            (jobApplicationsCollection.find as jest.Mock).mockReturnValue({
                toArray: jest.fn().mockResolvedValue([mockApp]),
            });
            (stagesCollection.findOne as jest.Mock).mockResolvedValue(mockStage);

            const res = await request(app)
                .get('/jobApplications')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].company).toBe('TestCorp');
            expect(res.body[0].lastStage).toEqual(mockStage);
        });

        it('should return 500 on DB error', async () => {
            (jobApplicationsCollection.find as jest.Mock).mockImplementation(() => {
                throw new Error('DB error');
            });

            const res = await request(app)
                .get('/jobApplications')
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to fetch job applications/);
        });
    });

    describe('GET /jobApplications/:jobId', () => {
        it('should get a single job application', async () => {
            (jobApplicationsCollection.findOne as jest.Mock).mockResolvedValue(mockApp);
            (stagesCollection.findOne as jest.Mock).mockResolvedValue(mockStage);

            const res = await request(app)
                .get(`/jobApplications/${mockJobId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.company).toBe('TestCorp');
            expect(res.body.lastStage).toEqual(mockStage);
        });

        it('should return 404 if not found', async () => {
            (jobApplicationsCollection.findOne as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .get(`/jobApplications/${mockJobId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/not found/);
        });

        it('should return 500 on DB error', async () => {
            (jobApplicationsCollection.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .get(`/jobApplications/${mockJobId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to fetch job application/);
        });
    });

    describe('PUT /jobApplications/:jobId', () => {
        it('should update a job application', async () => {
            (JobApplicationUpdateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: { company: 'NewCorp' } });
            (jobApplicationsCollection.findOneAndUpdate as jest.Mock).mockResolvedValue({ ...mockApp, company: 'NewCorp' });

            const res = await request(app)
                .put(`/jobApplications/${mockJobId}`)
                .send({ userId: mockUserId, data: { company: 'NewCorp' }, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.company).toBe('NewCorp');
        });

        it('should return 400 on validation error', async () => {
            (JobApplicationUpdateSchema.safeParse as jest.Mock).mockReturnValue({
                success: false,
                error: { issues: [{ message: 'Validation failed' }] },
            });

            const res = await request(app)
                .put(`/jobApplications/${mockJobId}`)
                .send({ userId: mockUserId, data: {}, filters: {} });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should return 404 if not found', async () => {
            (JobApplicationUpdateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: { company: 'NewCorp' } });
            (jobApplicationsCollection.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .put(`/jobApplications/${mockJobId}`)
                .send({ userId: mockUserId, data: { company: 'NewCorp' }, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/Not found/);
        });

        it('should return 500 on DB error', async () => {
            (JobApplicationUpdateSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: { company: 'NewCorp' } });
            (jobApplicationsCollection.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .put(`/jobApplications/${mockJobId}`)
                .send({ userId: mockUserId, data: { company: 'NewCorp' }, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to update job application/);
        });
    });

    describe('DELETE /jobApplications/:jobId', () => {
        it('should delete a job application', async () => {
            (jobApplicationsCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
            (stagesCollection.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });

            const res = await request(app)
                .delete(`/jobApplications/${mockJobId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/Deleted successfully/);
        });

        it('should return 404 if not found', async () => {
            (jobApplicationsCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

            const res = await request(app)
                .delete(`/jobApplications/${mockJobId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/Not found/);
        });

        it('should return 500 on DB error', async () => {
            (jobApplicationsCollection.deleteOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .delete(`/jobApplications/${mockJobId}`)
                .send({ userId: mockUserId, filters: {} });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Failed to delete job application/);
        });
    });
});