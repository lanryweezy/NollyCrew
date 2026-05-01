import type { Request } from 'express';
import { storage } from '../storage.js';
import { logger } from './logger.js';

export const logAction = async (req: Request, options: {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entityType: string;
  entityId: string;
  previousData?: any;
  newData?: any;
}) => {
  try {
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    await storage.createAuditLog({
      userId: userId || null,
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      previousData: options.previousData || null,
      newData: options.newData || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
};
