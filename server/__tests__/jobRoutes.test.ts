import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import { registerRoutes } from '../routes';
import { storage } from '../storage';

// Mock storage functions
vi.mock('../storage');

describe('Job Routes', () => {
  let app: Express;
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    await registerRoutes(app);

    // Default mock for authentication middleware to pass
    (storage.getUserByEmail as any).mockResolvedValue(mockUser);
    (storage.getUser as any).mockResolvedValue(mockUser);
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
        applicantId: '123',
        coverLetter: 'I am interested in this role'
      };

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
        applicantId: '123'
      });
      expect(storage.createJobApplication).toHaveBeenCalledWith({
        jobId: '1',
        applicantId: '123',
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