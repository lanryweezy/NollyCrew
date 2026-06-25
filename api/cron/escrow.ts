import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const cronModule = await import("../../dist/server/server/cron.js");
    await cronModule.handleEscrowRelease();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}
