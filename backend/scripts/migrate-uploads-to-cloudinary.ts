import { readFile } from "fs/promises";
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
      const filePath = path.join(uploadsDir, fileName);
      const buffer = await readFile(filePath);
      const url = await StorageService.uploadFile(buffer, fileName);
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
      const filePath = path.join(uploadsDir, fileName);
      const buffer = await readFile(filePath);
      const url = await StorageService.uploadFile(buffer, fileName);
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
      const filePath = path.join(uploadsDir, fileName);
      const buffer = await readFile(filePath);
      const url = await StorageService.uploadFile(buffer, fileName);
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
