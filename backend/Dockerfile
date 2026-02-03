FROM oven/bun:1.0

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

# Generate Prisma client at build time (helps produce client files)
RUN bunx prisma generate || true

EXPOSE 3001

# Ensure Prisma client is generated at container start as well. Some platforms
# may modify or not persist generated artifacts between build and runtime —
# running `prisma generate` at startup guarantees the client is available.
CMD ["sh", "-c", "bunx prisma generate && bun run index.ts"]
