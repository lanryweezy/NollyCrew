import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage.js';

export const requirePermission = (permission: string, projectIdParam?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    // If projectId is provided, check project-level permissions
    if (projectIdParam) {
      const projectId = req.params[projectIdParam] || req.body[projectIdParam] || req.query[projectIdParam];
      if (projectId) {
        const members = await storage.getProjectMembers(projectId);
        const member = members.find(m => m.userId === userId);
        
        if (!member) {
          return res.status(403).json({ error: 'Not a member of this project' });
        }

        const permissions = (member.permissions as string[]) || [];
        if (permissions.includes(permission) || member.role === 'producer' || member.role === 'director') {
          return next();
        }
        
        return res.status(403).json({ error: 'Insufficient permissions for this project' });
      }
    }

    // Otherwise, check global roles (simplified for now)
    const roles = await storage.getUserRoles(userId);
    if (roles.some(r => r.role === 'admin')) {
      return next();
    }

    res.status(403).json({ error: 'Insufficient global permissions' });
  };
};

export const canViewBudget = requirePermission('view_budget', 'projectId');
export const canEditSchedule = requirePermission('edit_schedule', 'projectId');
export const canManageMembers = requirePermission('manage_members', 'projectId');
