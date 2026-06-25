// Auth middleware - disabled for now (no auth required)
export const authenticateWithClerk = async (req: any, _res: any, next: any) => {
  // Pass through without authentication
  req.user = req.user || { id: 'anonymous', email: 'anonymous@example.com' };
  next();
};
