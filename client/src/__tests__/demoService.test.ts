import { describe, it, expect, vi } from 'vitest';
import {
  isDemoMode,
  getDemoUser,
  getDemoJobs,
  getDemoProjects,
  getDemoProfiles,
  getDemoAnalytics
} from '../lib/demoService';

describe('Demo Service', () => {
  describe('isDemoMode', () => {
    it('should return true when NODE_ENV is development', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'development' };
      
      expect(isDemoMode()).toBe(true);
      
      process.env = originalEnv;
    });

    it('should return true when DEMO_MODE is true', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, DEMO_MODE: 'true' };
      
      expect(isDemoMode()).toBe(true);
      
      process.env = originalEnv;
    });

    it('should return false when neither condition is met', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'production', DEMO_MODE: 'false' };
      
      expect(isDemoMode()).toBe(false);
      
      process.env = originalEnv;
    });
  });

  describe('getDemoUser', () => {
    it('should return demo user data with roles', () => {
      const demoData = getDemoUser();
      
      expect(demoData).toHaveProperty('user');
      expect(demoData).toHaveProperty('roles');
      
      // Check user properties
      expect(demoData.user).toHaveProperty('id', 'demo-user-id');
      expect(demoData.user).toHaveProperty('email', 'demo@example.com');
      expect(demoData.user).toHaveProperty('firstName', 'Demo');
      expect(demoData.user).toHaveProperty('lastName', 'User');
      expect(demoData.user).toHaveProperty('isVerified', true);
      
      // Check roles array
      expect(demoData.roles).toBeInstanceOf(Array);
      expect(demoData.roles.length).toBe(2);
      
      // Check first role (actor)
      const actorRole = demoData.roles[0];
      expect(actorRole).toHaveProperty('id', 'demo-role-1');
      expect(actorRole).toHaveProperty('userId', 'demo-user-id');
      expect(actorRole).toHaveProperty('role', 'actor');
      expect(actorRole).toHaveProperty('isActive', true);
      
      // Check second role (producer)
      const producerRole = demoData.roles[1];
      expect(producerRole).toHaveProperty('id', 'demo-role-2');
      expect(producerRole).toHaveProperty('userId', 'demo-user-id');
      expect(producerRole).toHaveProperty('role', 'producer');
      expect(producerRole).toHaveProperty('isActive', true);
    });
  });

  describe('getDemoJobs', () => {
    it('should return an array of demo jobs', () => {
      const jobs = getDemoJobs();
      
      expect(jobs).toBeInstanceOf(Array);
      expect(jobs.length).toBeGreaterThan(0);
      
      // Check first job
      const firstJob = jobs[0];
      expect(firstJob).toHaveProperty('id');
      expect(firstJob).toHaveProperty('title');
      expect(firstJob).toHaveProperty('type');
      expect(firstJob).toHaveProperty('company');
      expect(firstJob).toHaveProperty('location');
      expect(firstJob).toHaveProperty('budget');
      expect(firstJob).toHaveProperty('duration');
      expect(firstJob).toHaveProperty('deadline');
      expect(firstJob).toHaveProperty('description');
      expect(firstJob).toHaveProperty('requirements');
      expect(firstJob).toHaveProperty('applicants');
      expect(firstJob).toHaveProperty('isUrgent');
      expect(firstJob).toHaveProperty('isBookmarked');
    });
  });

  describe('getDemoProjects', () => {
    it('should return an array of demo projects', () => {
      const projects = getDemoProjects();
      
      expect(projects).toBeInstanceOf(Array);
      expect(projects.length).toBeGreaterThan(0);
      
      // Check first project
      const firstProject = projects[0];
      expect(firstProject).toHaveProperty('id');
      expect(firstProject).toHaveProperty('title');
      expect(firstProject).toHaveProperty('genre');
      expect(firstProject).toHaveProperty('status');
      expect(firstProject).toHaveProperty('progress');
      expect(firstProject).toHaveProperty('budget');
      expect(firstProject).toHaveProperty('director');
      expect(firstProject).toHaveProperty('startDate');
      expect(firstProject).toHaveProperty('deadline');
      expect(firstProject).toHaveProperty('teamSize');
      expect(firstProject).toHaveProperty('description');
      expect(firstProject).toHaveProperty('isOwner');
    });
  });

  describe('getDemoProfiles', () => {
    it('should return demo profiles organized by category', () => {
      const profiles = getDemoProfiles();
      
      expect(profiles).toBeInstanceOf(Object);
      expect(profiles).toHaveProperty('actors');
      expect(profiles).toHaveProperty('crew');
      expect(profiles).toHaveProperty('producers');
      
      // Check actors
      expect(profiles.actors).toBeInstanceOf(Array);
      expect(profiles.actors.length).toBeGreaterThan(0);
      
      const firstActor = profiles.actors[0];
      expect(firstActor).toHaveProperty('id');
      expect(firstActor).toHaveProperty('name');
      expect(firstActor).toHaveProperty('role', 'actor');
      expect(firstActor).toHaveProperty('location');
      expect(firstActor).toHaveProperty('specialties');
      expect(firstActor).toHaveProperty('rating');
      expect(firstActor).toHaveProperty('reviewCount');
      expect(firstActor).toHaveProperty('experience');
      expect(firstActor).toHaveProperty('recentProject');
      expect(firstActor).toHaveProperty('isVerified');
      expect(firstActor).toHaveProperty('isFollowing');
      
      // Check crew
      expect(profiles.crew).toBeInstanceOf(Array);
      expect(profiles.crew.length).toBeGreaterThan(0);
      
      // Check producers
      expect(profiles.producers).toBeInstanceOf(Array);
      expect(profiles.producers.length).toBeGreaterThan(0);
    });
  });

  describe('getDemoAnalytics', () => {
    it('should return demo analytics data', () => {
      const analytics = getDemoAnalytics();
      
      expect(analytics).toHaveProperty('totalProjects');
      expect(analytics).toHaveProperty('activeProjects');
      expect(analytics).toHaveProperty('completedProjects');
      expect(analytics).toHaveProperty('totalEarnings');
      expect(analytics).toHaveProperty('monthlyEarnings');
      expect(analytics).toHaveProperty('projectCompletionRate');
      expect(analytics).toHaveProperty('clientSatisfaction');
      expect(analytics).toHaveProperty('recentActivity');
      
      expect(analytics.recentActivity).toBeInstanceOf(Array);
      expect(analytics.recentActivity.length).toBeGreaterThan(0);
      
      const firstActivity = analytics.recentActivity[0];
      expect(firstActivity).toHaveProperty('id');
      expect(firstActivity).toHaveProperty('action');
      expect(firstActivity).toHaveProperty('time');
    });
  });
});