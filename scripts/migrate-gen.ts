import { config } from "dotenv";
import { execSync } from "child_process";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

try {
  console.log("Generating migration...");
  execSync("npx drizzle-kit generate", { stdio: "inherit" });
} catch (error) {
  console.error("Migration generation failed");
  process.exit(1);
}
