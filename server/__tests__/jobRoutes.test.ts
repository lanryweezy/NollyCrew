import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import { registerRoutes } from '../routes';
import { storage } from '../storage';
import * as jwt from 'jsonwebtoken';

// Mock storage functions
vi.mock('../storage');

describe('Job Routes', () => {
  let app: Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    await registerRoutes(app);
  });

  describe('GET /api/jobs', () => {
    it('should return jobs with filters', async () => {
      const mockJobs = [
        {
          id: '1',
          title: 'Lead Actor',
          type: 'casting',
          location: 'Lagos',
          isActive: true
        }
      ];

      (storage.getJobs as any).mockResolvedValue(mockJobs);

      const response = await request(app)
        .get('/api/jobs')
        .query({
          type: 'casting',
          location: 'Lagos',
          isActive: 'true'
        })
        .expect(200);

      expect(response.body).toEqual({
        jobs: mockJobs
      });
      expect(storage.getJobs).toHaveBeenCalledWith({
        type: 'casting',
        location: 'Lagos',
        isActive: true
      });
    });
  });

  describe('POST /api/jobs', () => {
    it('should create a new job when authenticated', async () => {
      const mockJob = {
        id: '1',
        title: 'Lead Actor',
        description: 'Looking for lead actor',
        type: 'casting',
        category: 'lead-actor',
        location: 'Lagos',
        postedById: '123',
        currency: 'NGN',
        isActive: true
      };

      // Mock JWT verification
      (jwt.verify as any).mockReturnValue({ userId: '123' });
      (storage.getUser as any).mockResolvedValue({ id: '123' });
      (storage.createJob as any).mockResolvedValue(mockJob);

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', 'Bearer mockToken')
        .send({
          title: 'Lead Actor',
          description: 'Looking for lead actor',
          type: 'casting',
          category: 'lead-actor',
          location: 'Lagos'
        })
        .expect(201);

      expect(response.body).toEqual({
        job: mockJob
      });
      expect(storage.createJob).toHaveBeenCalledWith({
        title: 'Lead Actor',
        description: 'Looking for lead actor',
        type: 'casting',
        category: 'lead-actor',
        location: 'Lagos',
        postedById: '123',
        currency: 'NGN',
        isActive: true
      });
    });
  });

  describe('POST /api/jobs/:jobId/apply', () => {
    it('should create a job application when authenticated', async () => {
      const mockJob = {
        id: '1',
        title: 'Lead Actor',
        type: 'casting',
        location: 'Lagos',
        isActive: true
      };

      const mockApplication = {
        id: '1',
        jobId: '1',
        applicantId: '456',
        coverLetter: 'I am interested in this role'
      };

      // Mock JWT verification
      (jwt.verify as any).mockReturnValue({ userId: '456' });
      (storage.getUser as any).mockResolvedValue({ id: '456' });
      (storage.getJob as any).mockResolvedValue(mockJob);
      (storage.getJobApplications as any).mockResolvedValue([]);
      (storage.createJobApplication as any).mockResolvedValue(mockApplication);

      const response = await request(app)
        .post('/api/jobs/1/apply')
        .set('Authorization', 'Bearer mockToken')
        .send({
          coverLetter: 'I am interested in this role'
        })
        .expect(201);

      expect(response.body).toEqual({
        application: mockApplication
      });
      expect(storage.getJob).toHaveBeenCalledWith('1');
      expect(storage.getJobApplications).toHaveBeenCalledWith({
        jobId: '1',
        applicantId: '456'
      });
      expect(storage.createJobApplication).toHaveBeenCalledWith({
        jobId: '1',
        applicantId: '456',
        coverLetter: 'I am interested in this role'
      });
    });

    it('should return error if user already applied', async () => {
      const mockJob = {
        id: '1',
        title: 'Lead Actor',
        type: 'casting',
        location: 'Lagos',
        isActive: true
      };

      // Mock JWT verification
      (jwt.verify as any).mockReturnValue({ userId: '456' });
      (storage.getUser as any).mockResolvedValue({ id: '456' });
      (storage.getJob as any).mockResolvedValue(mockJob);
      (storage.getJobApplications as any).mockResolvedValue([{}]); // Already applied

      const response = await request(app)
        .post('/api/jobs/1/apply')
        .set('Authorization', 'Bearer mockToken')
        .send({
          coverLetter: 'I am interested in this role'
        })
        .expect(400);

      expect(response.body).toEqual({
        error: 'You have already applied to this job'
      });
    });
  });
});