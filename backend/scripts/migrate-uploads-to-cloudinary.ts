import "../config/init-env";
import { readFile, readdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const uploadsDir = process.cwd().endsWith("backend")
  ? path.join(process.cwd(), "uploads")
  : path.join(process.cwd(), "backend", "uploads");

const CONCURRENCY = 5;

async function uploadToCloudinary(buffer: Buffer, fileName: string) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const folder = process.env.CLOUDINARY_FOLDER || "spiritual-connect";

  const ext = path.extname(fileName).replace(".", "") || "jpg";
  const publicId = `${path.parse(fileName).name}-${Date.now()}`;

  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`;

  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  const form = new FormData();

  form.append("file", `data:image/${ext};base64,${buffer.toString("base64")}`);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("public_id", publicId);
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    { method: "POST", body: form }
  );

  const json: any = await res.json();

  if (!res.ok) throw new Error(json?.error?.message || JSON.stringify(json));

  return json?.secure_url as string;
}

const getSuffix = (name: string) => {
  const index = name.indexOf("-");
  return index === -1 ? name : name.slice(index + 1);
};

async function getBufferForFile(fileName: string) {
  let filePath = path.join(uploadsDir, fileName);

  try {
    return { buffer: await readFile(filePath), fileName };
  } catch {
    const suffix = getSuffix(fileName);
    const files = await readdir(uploadsDir);

    const candidate = files.find((f) => f.endsWith(suffix));

    if (!candidate) throw new Error(`File not found: ${fileName}`);

    console.warn(`Fallback used: ${candidate}`);

    const fallbackPath = path.join(uploadsDir, candidate);

    return {
      buffer: await readFile(fallbackPath),
      fileName: candidate,
    };
  }
}

async function processItems(items: any[], field: string, table: string) {
  const queue = [...items];

  async function worker() {
    while (queue.length) {
      const item = queue.shift();
      if (!item) return;

      try {
        const localPath = item[field];
        const fileName = path.basename(localPath);

        const { buffer, fileName: resolved } =
          await getBufferForFile(fileName);

        const url = await uploadToCloudinary(buffer, resolved);

        await (prisma as any)[table].update({
          where: { id: item.id },
          data: { [field]: url },
        });

        console.log(`${table} ${item.id} migrated`);
      } catch (err) {
        console.error(`${table} ${item.id} failed`, err);
      }
    }
  }

  await Promise.all(Array(CONCURRENCY).fill(null).map(worker));
}

async function migrate() {
  console.log("Starting migration...");

  const posts = await prisma.post.findMany({
    where: { media: { startsWith: "/uploads/" } },
  });

  const blogs = await prisma.blog.findMany({
    where: { coverImage: { startsWith: "/uploads/" } },
  });

  const profiles = await prisma.profile.findMany({
    where: { avatar: { startsWith: "/uploads/" } },
  });

  console.log(`Posts: ${posts.length}`);
  console.log(`Blogs: ${blogs.length}`);
  console.log(`Profiles: ${profiles.length}`);

  await processItems(posts, "media", "post");
  await processItems(blogs, "coverImage", "blog");
  await processItems(profiles, "avatar", "profile");

  console.log("Migration complete");
}

migrate()
  .catch((err) => console.error(err))
  .finally(() => process.exit());