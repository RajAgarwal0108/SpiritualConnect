import dotenv from "dotenv";

// Load environment variables for testing
dotenv.config({ path: ".env.test" });

// If .env.test doesn't exist, use regular .env
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

// Set NODE_ENV to test
process.env.NODE_ENV = "test";

console.log("Test environment initialized");
