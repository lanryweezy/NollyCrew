import { registerRoutes } from "../dist/server/server/routes.js";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
// We need to wait for registerRoutes as it is async
const serverPromise = registerRoutes(app);

export default async (req: any, res: any) => {
  await serverPromise;
  return app(req, res);
};
