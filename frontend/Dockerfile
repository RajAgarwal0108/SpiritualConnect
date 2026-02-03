# Frontend Dockerfile for Next.js (used by Render)
FROM oven/bun:latest

WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install

# Copy source
COPY . ./

# Build the Next.js app
RUN bun run build

EXPOSE 3000
ENV PORT=3000

# Start using the PORT provided by the platform
CMD ["sh", "-c", "bun run start -- -p $PORT"]
