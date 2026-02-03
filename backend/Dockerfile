FROM oven/bun:latest

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy source code
COPY . .

# Generate Prisma client
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
RUN bun run postinstall

EXPOSE 3001

# Start the application
CMD ["bun", "run", "index.ts"]
