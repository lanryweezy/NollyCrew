import { describe, it, expect } from 'vitest';
import {
  mockUsers,
  mockUserRoles,
  mockJobs,
  mockProjects,
  mockProfiles,
  mockNotifications,
  mockMessages,
  mockAnalytics,
  getMockUser,
  getMockUserRoles,
  getMockJobs,
  getMockJob,
  getMockProjects,
  getMockProject,
  getMockProfiles,
  getMockProfile,
  getMockNotifications,
  getMockMessages,
  getMockAnalyticsData
} from '../lib/mockData';

describe('Mock Data', () => {
  describe('Users', () => {
    it('should have mock users with required fields', () => {
      expect(mockUsers).toBeInstanceOf(Array);
      expect(mockUsers.length).toBeGreaterThan(0);
      
      const user = mockUsers[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('isVerified');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('should retrieve a specific user by ID', () => {
      const user = getMockUser('demo-user-1');
      expect(user).toBeDefined();
      expect(user?.id).toBe('demo-user-1');
      expect(user?.firstName).toBe('Demo');
    });

    it('should return undefined for non-existent user', () => {
      const user = getMockUser('non-existent-id');
      expect(user).toBeUndefined();
    });
  });

  describe('User Roles', () => {
    it('should have mock user roles with required fields', () => {
      expect(mockUserRoles).toBeInstanceOf(Array);
      expect(mockUserRoles.length).toBeGreaterThan(0);
      
      const role = mockUserRoles[0];
      expect(role).toHaveProperty('id');
      expect(role).toHaveProperty('userId');
      expect(role).toHaveProperty('role');
      expect(role).toHaveProperty('isActive');
      expect(role).toHaveProperty('createdAt');
      expect(role).toHaveProperty('updatedAt');
    });

    it('should retrieve roles for a specific user', () => {
      const roles = getMockUserRoles('demo-user-1');
      expect(roles).toBeInstanceOf(Array);
      expect(roles.length).toBeGreaterThan(0);
      expect(roles[0].userId).toBe('demo-user-1');
    });

    it('should return empty array for user with no roles', () => {
      const roles = getMockUserRoles('user-with-no-roles');
      expect(roles).toBeInstanceOf(Array);
      expect(roles).toHaveLength(0);
    });
  });

  describe('Jobs', () => {
    it('should have mock jobs with required fields', () => {
      expect(mockJobs).toBeInstanceOf(Array);
      expect(mockJobs.length).toBeGreaterThan(0);
      
      const job = mockJobs[0];
      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('title');
      expect(job).toHaveProperty('type');
      expect(job).toHaveProperty('description');
      expect(job).toHaveProperty('requirements');
      expect(job).toHaveProperty('company');
      expect(job).toHaveProperty('location');
      expect(job).toHaveProperty('budget');
      expect(job).toHaveProperty('duration');
      expect(job).toHaveProperty('deadline');
      expect(job).toHaveProperty('isActive');
      expect(job).toHaveProperty('postedById');
      expect(job).toHaveProperty('applicantsCount');
      expect(job).toHaveProperty('isBookmarked');
      expect(job).toHaveProperty('isUrgent');
      expect(job).toHaveProperty('createdAt');
      expect(job).toHaveProperty('updatedAt');
    });

    it('should retrieve all jobs without filters', () => {
      const jobs = getMockJobs();
      expect(jobs).toBeInstanceOf(Array);
      expect(jobs.length).toBe(mockJobs.length);
    });

    it('should filter jobs by type', () => {
      const castingJobs = getMockJobs({ type: 'casting' });
      expect(castingJobs).toBeInstanceOf(Array);
      expect(castingJobs.every(job => job.type === 'casting')).toBe(true);
    });

    it('should filter jobs by location', () => {
      const lagosJobs = getMockJobs({ location: 'Lagos' });
      expect(lagosJobs).toBeInstanceOf(Array);
      expect(lagosJobs.every(job => job.location.includes('Lagos'))).toBe(true);
    });

    it('should retrieve a specific job by ID', () => {
      const job = getMockJob('demo-job-1');
      expect(job).toBeDefined();
      expect(job?.id).toBe('demo-job-1');
      expect(job?.title).toBe('Lead Actor - Romantic Drama');
    });

    it('should return undefined for non-existent job', () => {
      const job = getMockJob('non-existent-id');
      expect(job).toBeUndefined();
    });
  });

  describe('Projects', () => {
    it('should have mock projects with required fields', () => {
      expect(mockProjects).toBeInstanceOf(Array);
      expect(mockProjects.length).toBeGreaterThan(0);
      
      const project = mockProjects[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('title');
      expect(project).toHaveProperty('genre');
      expect(project).toHaveProperty('description');
      expect(project).toHaveProperty('status');
      expect(project).toHaveProperty('progress');
      expect(project).toHaveProperty('budget');
      expect(project).toHaveProperty('director');
      expect(project).toHaveProperty('producerId');
      expect(project).toHaveProperty('startDate');
      expect(project).toHaveProperty('deadline');
      expect(project).toHaveProperty('teamSize');
      expect(project).toHaveProperty('isOwner');
      expect(project).toHaveProperty('createdAt');
      expect(project).toHaveProperty('updatedAt');
    });

    it('should retrieve all projects without filters', () => {
      const projects = getMockProjects();
      expect(projects).toBeInstanceOf(Array);
      expect(projects.length).toBe(mockProjects.length);
    });

    it('should filter projects by status', () => {
      const productionProjects = getMockProjects({ status: 'production' });
      expect(productionProjects).toBeInstanceOf(Array);
      expect(productionProjects.every(project => project.status === 'production')).toBe(true);
    });

    it('should retrieve a specific project by ID', () => {
      const project = getMockProject('demo-project-1');
      expect(project).toBeDefined();
      expect(project?.id).toBe('demo-project-1');
      expect(project?.title).toBe('Love in Lagos');
    });

    it('should return undefined for non-existent project', () => {
      const project = getMockProject('non-existent-id');
      expect(project).toBeUndefined();
    });
  });

  describe('Profiles', () => {
    it('should have mock profiles with required fields', () => {
      expect(mockProfiles).toBeInstanceOf(Array);
      expect(mockProfiles.length).toBeGreaterThan(0);
      
      const profile = mockProfiles[0];
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('role');
      expect(profile).toHaveProperty('location');
      expect(profile).toHaveProperty('specialties');
      expect(profile).toHaveProperty('rating');
      expect(profile).toHaveProperty('reviewCount');
      expect(profile).toHaveProperty('experience');
      expect(profile).toHaveProperty('recentProject');
      expect(profile).toHaveProperty('isVerified');
      expect(profile).toHaveProperty('isFollowing');
    });

    it('should retrieve all profiles without filters', () => {
      const profiles = getMockProfiles();
      expect(profiles).toBeInstanceOf(Array);
      expect(profiles.length).toBe(mockProfiles.length);
    });

    it('should filter profiles by role', () => {
      const actorProfiles = getMockProfiles({ role: 'actor' });
      expect(actorProfiles).toBeInstanceOf(Array);
      expect(actorProfiles.every(profile => profile.role === 'actor')).toBe(true);
    });

    it('should filter profiles by location', () => {
      const lagosProfiles = getMockProfiles({ location: 'Lagos' });
      expect(lagosProfiles).toBeInstanceOf(Array);
      expect(lagosProfiles.every(profile => profile.location.includes('Lagos'))).toBe(true);
    });

    it('should retrieve a specific profile by ID', () => {
      const profile = getMockProfile('demo-profile-1');
      expect(profile).toBeDefined();
      expect(profile?.id).toBe('demo-profile-1');
      expect(profile?.name).toBe('Funke Akindele');
    });

    it('should return undefined for non-existent profile', () => {
      const profile = getMockProfile('non-existent-id');
      expect(profile).toBeUndefined();
    });
  });

  describe('Notifications', () => {
    it('should have mock notifications with required fields', () => {
      expect(mockNotifications).toBeInstanceOf(Array);
      expect(mockNotifications.length).toBeGreaterThan(0);
      
      const notification = mockNotifications[0];
      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('type');
      expect(notification).toHaveProperty('title');
      expect(notification).toHaveProperty('message');
      expect(notification).toHaveProperty('time');
      expect(notification).toHaveProperty('isRead');
    });

    it('should retrieve notifications with optional limit', () => {
      const allNotifications = getMockNotifications();
      const limitedNotifications = getMockNotifications(2);
      
      expect(allNotifications).toBeInstanceOf(Array);
      expect(limitedNotifications).toBeInstanceOf(Array);
      expect(limitedNotifications.length).toBe(2);
      expect(limitedNotifications.length).toBeLessThanOrEqual(allNotifications.length);
    });
  });

  describe('Messages', () => {
    it('should have mock messages with required fields', () => {
      expect(mockMessages).toBeInstanceOf(Array);
      expect(mockMessages.length).toBeGreaterThan(0);
      
      const message = mockMessages[0];
      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('senderId');
      expect(message).toHaveProperty('senderName');
      expect(message).toHaveProperty('content');
      expect(message).toHaveProperty('timestamp');
      expect(message).toHaveProperty('isRead');
    });

    it('should retrieve messages with optional limit', () => {
      const allMessages = getMockMessages();
      const limitedMessages = getMockMessages(2);
      
      expect(allMessages).toBeInstanceOf(Array);
      expect(limitedMessages).toBeInstanceOf(Array);
      expect(limitedMessages.length).toBe(2);
      expect(limitedMessages.length).toBeLessThanOrEqual(allMessages.length);
    });
  });

  describe('Analytics', () => {
    it('should have mock analytics data with required fields', () => {
      expect(mockAnalytics).toHaveProperty('totalProjects');
      expect(mockAnalytics).toHaveProperty('activeProjects');
      expect(mockAnalytics).toHaveProperty('completedProjects');
      expect(mockAnalytics).toHaveProperty('totalEarnings');
      expect(mockAnalytics).toHaveProperty('monthlyEarnings');
      expect(mockAnalytics).toHaveProperty('projectCompletionRate');
      expect(mockAnalytics).toHaveProperty('clientSatisfaction');
      expect(mockAnalytics).toHaveProperty('recentActivity');
      
      expect(mockAnalytics.recentActivity).toBeInstanceOf(Array);
      expect(mockAnalytics.recentActivity.length).toBeGreaterThan(0);
      
      const activity = mockAnalytics.recentActivity[0];
      expect(activity).toHaveProperty('id');
      expect(activity).toHaveProperty('action');
      expect(activity).toHaveProperty('time');
    });

    it('should retrieve analytics data', () => {
      const analytics = getMockAnalyticsData();
      expect(analytics).toEqual(mockAnalytics);
    });
  });
});