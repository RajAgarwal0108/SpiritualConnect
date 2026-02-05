import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";
import { v2 as cloudinary } from "cloudinary";
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
    
    if (this.storageType === "cloudinary") {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
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
    const fileExtension = fileName.split(".").pop();
    const baseName = uuidv4();
    const uniqueFileName = `${baseName}.${fileExtension}`;

    if (this.storageType === "cloudinary") {
      const folder = process.env.CLOUDINARY_FOLDER || "spiritual_connect";
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, public_id: baseName, overwrite: true },
          (error: any, result: any) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );

        const bufferStream = new Readable();
        bufferStream.push(fileBuffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
      });
    }

    // Fallback to local storage
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

        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
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
