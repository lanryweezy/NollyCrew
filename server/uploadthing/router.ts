import { createUploadthing, type FileRouter } from "uploadthing/express";

const f = createUploadthing();

export const ourFileRouter = {
  scriptUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(async ({ req }) => {
      const userId = (req as any).user?.id || 'anonymous';
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL", file.url);
      return { uploadedBy: metadata.userId };
    }),
    
  mediaUploader: f({ image: { maxFileSize: "4MB" }, video: { maxFileSize: "32MB" } })
    .middleware(async ({ req }) => {
      const userId = (req as any).user?.id || 'anonymous';
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
