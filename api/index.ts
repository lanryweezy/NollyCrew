import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
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
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  try {
    const { registerRoutes } = await import("../dist/server/server/routes.js");
    await registerRoutes(app);
  } catch (err) {
    console.error("Failed to register routes:", err);
  }

  app.get('/debug/paths', async (_req: Request, res: Response) => {
    const getDir = async (dir: string) => {
      try { return await fs.readdir(dir, { recursive: true }); }
      catch (e) { return [`Error: ${e}`]; }
    };
    res.json({
      cwd: process.cwd(),
      rootPath,
      distPath,
      publicPath,
      distFiles: await getDir(distPath),
      publicFiles: await getDir(publicPath),
    });
  });

  app.get('/assets/:file', async (req: Request, res: Response) => {
    const filePath = path.join(distPath, 'assets', req.params.file);
    try {
      const content = await fs.readFile(filePath);
      if (req.params.file.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
      else if (req.params.file.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
      res.send(content);
    } catch {
      res.status(404).send('Asset not found');
    }
  });

  app.use(express.static(distPath, { fallthrough: true }));
  app.use(express.static(publicPath, { fallthrough: true }));

  app.get("*", async (req: Request, res: Response) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }

    const indexPath = path.join(distPath, "index.html");
    const fallbackPath = path.join(publicPath, "index.html");
    
    let activePath = indexPath;
    try { await fs.access(indexPath); }
    catch {
      try { await fs.access(fallbackPath); activePath = fallbackPath; }
      catch { return res.status(500).send("Frontend assets not found."); }
    }

    try {
      let html = await fs.readFile(activePath, "utf-8");
      let title = "NollyCrew - All-in-One Nollywood Platform";
      let description = "Connect actors, crew, and producers in the Nollywood industry.";
      let ogImage = "https://nollycrew.com/og-image.png";

      if (req.path.startsWith("/talent/")) {
        const userId = req.path.split("/")[2];
        if (userId) {
          try {
            const { storage } = await import("../dist/server/server/storage.js");
            const user = await storage.getUser(userId);
            const roles = await storage.getUserRoles(userId);
            if (user) {
              const roleNames = roles.map((r: any) => r.role).join(", ");
              title = `${user.firstName} ${user.lastName} - ${roleNames} | NollyCrew`;
              description = user.bio || `${user.firstName} is a ${roleNames} on NollyCrew.`;
              if (user.avatar) ogImage = user.avatar;
            }
          } catch (_e) {}
        }
      } else if (req.path.startsWith("/jobs/")) {
        const jobId = req.path.split("/")[2];
        if (jobId) {
          try {
            const { storage } = await import("../dist/server/server/storage.js");
            const job = await storage.getJob(jobId);
            if (job) {
              title = `${job.title} - Job Opportunity | NollyCrew`;
              description = `New ${job.type} job in ${job.location}`;
            }
          } catch (_e) {}
        }
      }

      html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
      html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`);
      html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`);
      
      if (html.includes('property="og:image"')) {
        html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${ogImage}">`);
      } else {
        html = html.replace(/(<meta property="og:description" content="[^"]*">)/, `$1\n    <meta property="og:image" content="${ogImage}">`);
      }

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
