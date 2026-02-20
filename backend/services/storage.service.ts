import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

/**
 * Storage Service
 */
export class StorageService {
  private static uploadDir = join(process.cwd(), "uploads");
  private static storageType = process.env.STORAGE_TYPE || "local";
  private static isInitialized = false;

  private static init() {
    if (this.isInitialized) return;
    
    const storageType = process.env.STORAGE_TYPE || "local";
    console.log(`StorageService: Initializing with type ${storageType}`);
    
    if (storageType === "cloudinary") {
      const config = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
      };
      
      if (!config.cloud_name || !config.api_key || !config.api_secret) {
        console.warn("StorageService: Cloudinary credentials missing! Using unsigned upload if preset is provided.");
      }

      cloudinary.config(config);
    }
    this.isInitialized = true;
  }

  private static async ensureDir() {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Uploads a file and returns the URL
   */
  static async uploadFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    this.init();
    const storageType = process.env.STORAGE_TYPE || "local";
    console.log(`StorageService: Uploading ${fileName} (${fileBuffer.length} bytes). Storage Type: ${storageType}`);
    
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
    const baseName = uuidv4();
    const uniqueFileName = `${baseName}.${fileExtension}`;

    if (storageType === "cloudinary") {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      const folder = process.env.CLOUDINARY_FOLDER || "spiritual-connect";
      const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "spiritual-connect";
      
      try {
        const uploadOptions: any = {
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          folder,
          public_id: baseName,
          overwrite: true,
          resource_type: "auto",
        };

        if (uploadPreset) {
          uploadOptions.upload_preset = uploadPreset;
        }

        if (!apiSecret) {
          uploadOptions.unsigned = true;
        }

        // Using base64 for maximum reliability in Node environment
        const b64 = fileBuffer.toString("base64");
        const mimeType = fileExtension === "pdf" ? "application/pdf" : 
                         ["mp4", "mov", "avi"].includes(fileExtension) ? `video/${fileExtension}` : 
                         `image/${fileExtension || "png"}`;
        
        const dataUri = `data:${mimeType};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

        return result.secure_url;
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
      }
    }    // Fallback to local storage
    console.log(`StorageService: Falling back to local storage for ${uniqueFileName}`);
    await this.ensureDir();
    const filePath = join(this.uploadDir, uniqueFileName);
    await writeFile(filePath, fileBuffer);
    
    return `/uploads/${uniqueFileName}`;
  }

  /**
   * Deletes a file from storage
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    this.init();
    if (this.storageType === "cloudinary" && fileUrl.includes("cloudinary.com")) {
      try {
        const splitUrl = fileUrl.split("/");
        const lastPart = splitUrl[splitUrl.length - 1];
        if (!lastPart) return;

        // lastPart is typically <public_id>.<ext>
        const publicIdWithExtension = lastPart.split(".")[0];
        if (!publicIdWithExtension) return;

        const folder = process.env.CLOUDINARY_FOLDER || "spiritual_connect";
        const publicId = `${folder}/${publicIdWithExtension}`;

        // Infer resource type from extension
        const ext = lastPart.split(".").pop()?.toLowerCase();
        const videoExtensions = ["mp4", "mov", "avi", "webm", "mkv"];
        const resourceType = ext && videoExtensions.includes(ext) ? "video" : "image";

        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      } catch (error) {
        console.error("Failed to delete Cloudinary file:", error);
      }
      return;
    }

    if (fileUrl.startsWith("/uploads/")) {
      const fileName = fileUrl.replace("/uploads/", "");
      const filePath = join(this.uploadDir, fileName);
      try {
        await unlink(filePath);
      } catch (error) {
        console.error("Failed to delete local file:", error);
      }
    }
  }

  /**
   * Replaces an old file with a new one
   */
  static async replaceFile(oldUrl: string | null, newBuffer: Buffer, newName: string): Promise<string> {
    if (oldUrl) {
      await this.deleteFile(oldUrl);
    }
    return this.uploadFile(newBuffer, newName);
  }
}
