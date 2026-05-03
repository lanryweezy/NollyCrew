import { registerRoutes } from "../dist/server/server/routes.js";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { storage } from "../dist/server/server/storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
const serverPromise = registerRoutes(app);

// Use absolute paths relative to process.cwd() for Vercel, fallback to __dirname
const getPath = (relPath: string) => {
  const cwdPath = path.resolve(process.cwd(), relPath);
  return cwdPath;
};

const distPath = getPath('dist/public');
const publicPath = getPath('public');

// Serve static files from the build output directory first
// We explicitly set the content-type for assets to prevent MIME errors
app.use('/assets', express.static(path.join(distPath, 'assets'), {
  maxAge: '1y',
  immutable: true,
  fallthrough: true
}));

app.use(express.static(distPath, { fallthrough: true }));
app.use(express.static(publicPath, { fallthrough: true }));

app.get('*', async (req, res) => {
  // If it's an API request that wasn't caught by registerRoutes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Handle HTML serving with metadata injection
  const indexPath = path.join(distPath, 'index.html');
  const fallbackPath = path.join(publicPath, 'index.html');
  
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
    let html = await fs.readFile(activePath, 'utf-8');
    
    // Default metadata
    let title = 'NollyCrew - All-in-One Nollywood Platform';
    let description = 'Connect actors, crew, and producers in the Nollywood industry. AI-powered script breakdown, casting calls, and project management.';
    let ogImage = 'https://nollycrew.com/og-image.png';

    // Dynamic metadata logic
    if (req.path.startsWith('/talent/')) {
      const userId = req.path.split('/')[2];
      if (userId) {
        const user = await storage.getUser(userId);
        const roles = await storage.getUserRoles(userId);
        if (user) {
          const roleNames = roles.map(r => r.role).join(', ');
          title = `${user.firstName} ${user.lastName} - ${roleNames} | NollyCrew`;
          description = user.bio || `${user.firstName} is a ${roleNames} on NollyCrew. Check out their portfolio and credits.`;
          if (user.avatar) ogImage = user.avatar;
        }
      }
    } else if (req.path.startsWith('/jobs/')) {
      const jobId = req.path.split('/')[2];
      if (jobId) {
        const job = await storage.getJob(jobId);
        if (job) {
          title = `${job.title} - Job Opportunity | NollyCrew`;
          description = `New ${job.type} job in ${job.location}: ${job.description.substring(0, 150)}...`;
        }
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
