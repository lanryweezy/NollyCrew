import { createClerkClient } from '@clerk/clerk-sdk-node';
import { logger } from '../utils/logger.js';
import { storage } from '../storage.js';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const authenticateWithClerk = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Verify the session token with Clerk
    const sessionClaims = await clerkClient.verifyToken(token);
    
    // Clerk's 'sub' is the external user ID
    // We check if this user exists in our local DB metadata
    let user = await storage.getUserByEmail(sessionClaims.email as string);
    
    if (!user) {
        // Boss move: Just-in-time user creation
        // If they are in Clerk but not our DB, sync them now
        user = await storage.createUser({
            email: sessionClaims.email as string,
            firstName: sessionClaims.first_name as string || '',
            lastName: sessionClaims.last_name as string || '',
            passwordHash: 'clerk-managed', // No local password needed
            avatar: sessionClaims.image_url as string || null,
        } as any);
        logger.info('Synced new Clerk user to local DB', { userId: user.id });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn('Clerk authentication failed', { error: (error as Error).message });
    return res.status(403).json({ error: 'Invalid or expired session' });
  }
};
