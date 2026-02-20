import dotenv from "dotenv";
import path from "path";

// Explicitly load .env from the backend root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log(`Environment initialized. STORAGE_TYPE: ${process.env.STORAGE_TYPE}`);
