import "../config/init-env";
import { StorageService } from "../services/storage.service";
import fs from "fs";
import path from "path";

async function runProductionTest() {
  console.log("--- Cloudinary Production Readiness Test ---");
  
  // 1. Check environment variables
  const requiredVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CLOUDINARY_UPLOAD_PRESET"
  ];
  
  console.log("Checking Environment Variables...");
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.warn("⚠️  Missing environment variables:", missing.join(", "));
  } else {
    console.log("✅ All required environment variables are present.");
  }
  
  console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`Storage Type: ${process.env.STORAGE_TYPE}`);
  
  // 2. Perform a test upload
  console.log("\nTesting Upload...");
  try {
    // Creating a transparent 1x1 PNG pixel as a test buffer
    const testPixelBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(testPixelBase64, 'base64');
    const fileName = "prod_test_pixel.png";
    
    const startTime = Date.now();
    const url = await StorageService.uploadFile(buffer, fileName);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Upload Successful in ${duration}ms!`);
    console.log(`🔗 URL: ${url}`);
    
    if (url.includes("cloudinary.com")) {
      console.log("✅ Verified: URL belongs to Cloudinary.");
    } else {
      console.warn("⚠️  Warning: URL does not appear to be a Cloudinary URL.");
    }
    
    // 3. Perform a test delete
    console.log("\nTesting Deletion...");
    const deleteStartTime = Date.now();
    await StorageService.deleteFile(url);
    const deleteDuration = Date.now() - deleteStartTime;
    console.log(`✅ Deletion request completed in ${deleteDuration}ms.`);
    
    console.log("\n--- Test Result: SUCCESS ---");
    console.log("Cloudinary integration is ready for production 🚀");
    
  } catch (error) {
    console.error("\n❌ Test Failed!");
    console.error("Error details:", error);
    process.exit(1);
  }
}

runProductionTest();
