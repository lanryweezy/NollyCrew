import { handleEscrowRelease } from "../../dist/server/server/cron.js";

export default async function handler(req: any, res: any) {
  // Vercel adds this header to cron requests
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await handleEscrowRelease();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}
