FROM oven/bun:latest

WORKDIR /app


# Install dependencies
# Ensure Prisma schema is available to postinstall hooks during `bun install`.
# Copy the prisma folder before installing so `bunx prisma generate` can run.
COPY package.json bun.lock prisma ./
RUN bun install

# Copy source code
COPY . .

# Ensure Prisma client is generated explicitly after full source is present
# This is a defensive step to guarantee the generated client exists in the image.
RUN bun run generate

# Generate Prisma client
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
RUN bun run postinstall

EXPOSE 3001

# Start the application
CMD ["bun", "run", "index.ts"]
