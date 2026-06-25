import express, { type Request, type Response } from "express";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, "..");
const distPath = path.join(rootPath, "dist", "public");
const publicPath = path.join(rootPath, "public");

let app: express.Express | null = null;

async function getApp(): Promise<express.Express> {
  if (app) return app;
  app = express();

  // Debug endpoint
  app.get('/debug', async (_req: Request, res: Response) => {
    const listDir = async (dir: string) => {
      try { return await fs.readdir(dir); } catch { return []; }
    };
    res.json({
      cwd: process.cwd(),
      distFiles: await listDir(distPath),
      publicFiles: await listDir(publicPath),
    });
  });

  // Serve static assets with correct MIME types
  app.get('/assets/:file', async (req: Request, res: Response) => {
    const filePath = path.join(distPath, 'assets', req.params.file);
    try {
      const content = await fs.readFile(filePath);
      if (req.params.file.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
      else if (req.params.file.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
      res.send(content);
    } catch {
      res.status(404).send('Not found');
    }
  });

  app.use(express.static(distPath, { fallthrough: true }));
  app.use(express.static(publicPath, { fallthrough: true }));

  // SPA catch-all - serve index.html
  app.get("*", async (req: Request, res: Response) => {
    const indexPath = path.join(distPath, "index.html");
    const fallbackPath = path.join(publicPath, "index.html");

    let activePath = indexPath;
    try { await fs.access(indexPath); }
    catch {
      try { await fs.access(fallbackPath); activePath = fallbackPath; }
      catch { return res.status(500).send("Frontend not found. Run 'npm run build'."); }
    }

    try {
      const html = await fs.readFile(activePath, "utf-8");
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch {
      res.sendFile(activePath);
    }
  });

  return app;
}

export default async (req: Request, res: Response) => {
  const application = await getApp();
  return application(req, res);
};
