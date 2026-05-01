import { createUploadthing, type FileRouter } from "uploadthing/express";
import { verify as jwtVerify } from "../utils/jwt.js";

const f = createUploadthing();

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

const auth = async (req: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    const decoded: any = jwtVerify(token, JWT_SECRET);
    return { id: decoded.userId };
  } catch {
    return null;
  }
};

export const ourFileRouter = {
  scriptUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL", file.url);
      return { uploadedBy: metadata.userId };
    }),
    
  mediaUploader: f({ image: { maxFileSize: "4MB" }, video: { maxFileSize: "32MB" } })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
