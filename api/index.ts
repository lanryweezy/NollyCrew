import { registerRoutes } from "../dist/server/server/routes.js";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { storage } from "../dist/server/server/storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel, the API is in /api, so the root is ..
const rootPath = path.resolve(__dirname, "..");
const distPath = path.join(rootPath, "dist", "public");
const publicPath = path.join(rootPath, "public");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
const serverPromise = registerRoutes(app);

// Debug endpoint to check file paths on Vercel
app.get('/debug/paths', async (req, res) => {
  const getDir = async (dir: string) => {
    try {
      return await fs.readdir(dir, { recursive: true });
    } catch (e) {
      return [`Error reading ${dir}: ${e}`];
    }
  };
  
  res.json({
    cwd: process.cwd(),
    dirname: __dirname,
    rootPath,
    distPath,
    publicPath,
    distFiles: await getDir(distPath),
    publicFiles: await getDir(publicPath),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL
    }
  });
});

// 1. Specialized asset serving with explicit MIME types
app.get('/assets/:file', async (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(distPath, 'assets', fileName);
  
  try {
    const content = await fs.readFile(filePath);
    if (fileName.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
    else if (fileName.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
    res.send(content);
  } catch (e) {
    res.status(404).send('Asset not found');
  }
});

// 2. Fallback static serving
app.use(express.static(distPath, { fallthrough: true }));
app.use(express.static(publicPath, { fallthrough: true }));

app.get("*", async (req, res) => {
  // If it's an API request, it should have been handled by registerRoutes
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  // Final catch-all for HTML serving with metadata injection
  const indexPath = path.join(distPath, "index.html");
  const fallbackPath = path.join(publicPath, "index.html");
  
  let activePath = indexPath;
  try {
    await fs.access(indexPath);
  } catch {
    try {
      await fs.access(fallbackPath);
      activePath = fallbackPath;
    } catch {
      return res.status(500).send("Frontend assets not found. Please run 'npm run build' first.");
    }
  }

  try {
    let html = await fs.readFile(activePath, "utf-8");
    
    // Default metadata
    let title = "NollyCrew - All-in-One Nollywood Platform";
    let description = "Connect actors, crew, and producers in the Nollywood industry. AI-powered script breakdown, casting calls, and project management.";
    let ogImage = "https://nollycrew.com/og-image.png";

    // Dynamic metadata logic
    if (req.path.startsWith("/talent/")) {
      const userId = req.path.split("/")[2];
      if (userId) {
        try {
          const user = await storage.getUser(userId);
          const roles = await storage.getUserRoles(userId);
          if (user) {
            const roleNames = roles.map(r => r.role).join(", ");
            title = `${user.firstName} ${user.lastName} - ${roleNames} | NollyCrew`;
            description = user.bio || `${user.firstName} is a ${roleNames} on NollyCrew.`;
            if (user.avatar) ogImage = user.avatar;
          }
        } catch (e) {}
      }
    } else if (req.path.startsWith("/jobs/")) {
      const jobId = req.path.split("/")[2];
      if (jobId) {
        try {
          const job = await storage.getJob(jobId);
          if (job) {
            title = `${job.title} - Job Opportunity | NollyCrew`;
            description = `New ${job.type} job in ${job.location}`;
          }
        } catch (e) {}
      }
    }

    // Inject into HTML
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
  } catch (error) {
    res.sendFile(activePath);
  }
});

export default async (req: any, res: any) => {
  await serverPromise;
  return app(req, res);
};
