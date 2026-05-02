import { registerRoutes } from "../dist/server/server/routes.js";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs/promises";
import { storage } from "../dist/server/server/storage.js";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
const serverPromise = registerRoutes(app);

const distPath = path.join(process.cwd(), 'dist/public');
const publicPath = path.join(process.cwd(), 'public');

// Middleware to serve static files manually if needed, or use express.static
app.use(express.static(distPath));
app.use(express.static(publicPath));

app.get('*', async (req, res) => {
  // If it's an API request, it should have been handled by registerRoutes
  // But since we route everything here, we must be careful.
  if (req.path.startsWith('/api')) {
    // Let the registered routes handle it.
    // If we are here, it means no API route matched.
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Handle HTML serving with metadata injection
  const indexPath = path.join(distPath, 'index.html');
  const fallbackPath = path.join(publicPath, 'index.html');
  
  let activePath = indexPath;
  try {
    await fs.access(indexPath);
  } catch {
    activePath = fallbackPath;
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
