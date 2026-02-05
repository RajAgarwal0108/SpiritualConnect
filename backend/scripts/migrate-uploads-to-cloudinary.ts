import { readFile, readdir } from "fs/promises";
import path from "path";
import { prisma } from "../lib/prisma";
import { StorageService } from "../services/storage.service";

async function migrate() {
  console.log("Starting migration: local uploads -> Cloudinary");

  const uploadsDir = path.join(process.cwd(), "backend", "uploads");

  // Process Posts
  const posts = await prisma.post.findMany({ where: { media: { startsWith: "/uploads/" } } });
  console.log(`Found ${posts.length} posts with local media`);
  for (const p of posts) {
    try {
      const localPath = p.media as string; // e.g. /uploads/filename.jpg
      const fileName = path.basename(localPath);
      let filePath = path.join(uploadsDir, fileName);
      let buffer;
      try {
        buffer = await readFile(filePath);
      } catch (err) {
        // fallback: try to find any file in uploads that endsWith the suffix after the first dash
        const suffix = fileName.includes("-") ? fileName.split(/-(.+)/)[1] : fileName;
        const files = (await readdir(uploadsDir)) as string[];
        const candidates = files.filter((f) => f.endsWith(suffix));
        if (candidates.length > 0) {
          // pick the first candidate (could be improved to pick newest)
          const candidate = candidates[0] as string;
          filePath = path.join(uploadsDir, candidate);
          buffer = await readFile(filePath);
          console.warn(`Post ${p.id}: original file ${fileName} not found, using fallback ${candidate}`);
        } else {
          throw err;
        }
      }

      const url = await StorageService.uploadFile(buffer, path.basename(filePath));
      await prisma.post.update({ where: { id: p.id }, data: { media: url } });
      console.log(`Post ${p.id}: migrated -> ${url}`);
    } catch (err) {
      console.error(`Post ${p.id}: failed to migrate -`, (err as Error).message);
    }
  }

  // Process Blogs
  const blogs = await prisma.blog.findMany({ where: { coverImage: { startsWith: "/uploads/" } } });
  console.log(`Found ${blogs.length} blogs with local coverImage`);
  for (const b of blogs) {
    try {
      const localPath = b.coverImage as string;
      const fileName = path.basename(localPath);
      let filePath = path.join(uploadsDir, fileName);
      let buffer;
      try {
        buffer = await readFile(filePath);
      } catch (err) {
        const suffix = fileName.includes("-") ? fileName.split(/-(.+)/)[1] : fileName;
        const files = (await readdir(uploadsDir)) as string[];
        const candidates = files.filter((f) => f.endsWith(suffix));
        if (candidates.length > 0) {
          const candidate = candidates[0] as string;
          filePath = path.join(uploadsDir, candidate);
          buffer = await readFile(filePath);
          console.warn(`Blog ${b.id}: original file ${fileName} not found, using fallback ${candidate}`);
        } else {
          throw err;
        }
      }

      const url = await StorageService.uploadFile(buffer, path.basename(filePath));
      await prisma.blog.update({ where: { id: b.id }, data: { coverImage: url } });
      console.log(`Blog ${b.id}: migrated -> ${url}`);
    } catch (err) {
      console.error(`Blog ${b.id}: failed to migrate -`, (err as Error).message);
    }
  }

  // Process Profiles (avatars)
  const profiles = await prisma.profile.findMany({ where: { avatar: { startsWith: "/uploads/" } } });
  console.log(`Found ${profiles.length} profiles with local avatar`);
  for (const pr of profiles) {
    try {
      const localPath = pr.avatar as string;
      const fileName = path.basename(localPath);
      let filePath = path.join(uploadsDir, fileName);
      let buffer;
      try {
        buffer = await readFile(filePath);
      } catch (err) {
        const suffix = fileName.includes("-") ? fileName.split(/-(.+)/)[1] : fileName;
        const files = (await readdir(uploadsDir)) as string[];
        const candidates = files.filter((f) => f.endsWith(suffix));
        if (candidates.length > 0) {
          const candidate = candidates[0] as string;
          filePath = path.join(uploadsDir, candidate);
          buffer = await readFile(filePath);
          console.warn(`Profile ${pr.id}: original file ${fileName} not found, using fallback ${candidate}`);
        } else {
          throw err;
        }
      }

      const url = await StorageService.uploadFile(buffer, path.basename(filePath));
      await prisma.profile.update({ where: { id: pr.id }, data: { avatar: url } });
      console.log(`Profile ${pr.id}: migrated -> ${url}`);
    } catch (err) {
      console.error(`Profile ${pr.id}: failed to migrate -`, (err as Error).message);
    }
  }

  console.log("Migration complete.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
