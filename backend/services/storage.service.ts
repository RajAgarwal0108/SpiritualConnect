import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { uploadFile } from "@huggingface/hub";
import { existsSync } from "fs";

/**
 * Storage Service
 * Supports Local Storage and Hugging Face Cloud Storage
 */
export class StorageService {
  private static uploadDir = join(process.cwd(), "uploads");
  private static hfToken = process.env.HF_TOKEN;
  private static hfRepo = process.env.HF_REPO_ID; // e.g. "username/spiritual-assets"

  private static async ensureDir() {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Uploads a file and returns the URL
   */
  static async uploadFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;

    // If Hugging Face is configured, upload there
    if (this.hfToken && this.hfRepo) {
      try {
        await uploadFile({
          repo: { type: "dataset", name: this.hfRepo },
          credentials: { accessToken: this.hfToken },
          file: {
            path: `uploads/${uniqueFileName}`,
            content: new Blob([fileBuffer])
          }
        });
        
        // Return Hugging Face resolve URL
        return `https://huggingface.co/datasets/${this.hfRepo}/resolve/main/uploads/${uniqueFileName}`;
      } catch (error) {
        console.error("Hugging Face Upload Failed, falling back to local:", error);
      }
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
    // Note: HF deletion is more complex (requires commit), 
    // for simplicity in MVP we focus on local deletion fallback
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
