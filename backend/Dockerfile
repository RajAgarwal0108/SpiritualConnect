FROM oven/bun:1.0

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

# Generate Prisma client at build time
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
RUN bun run generate

EXPOSE 3001

# Start the application. We run generate again at start to be absolutely sure.
CMD ["sh", "-c", "PRISMA_CLIENT_ENGINE_TYPE=binary bun run generate && bun run index.ts"]
