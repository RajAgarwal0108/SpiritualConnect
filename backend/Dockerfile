FROM oven/bun:1.0

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

# Generate Prisma client at build time to a specific folder
RUN bunx prisma generate

EXPOSE 3001

# Start the application
CMD ["bun", "run", "index.ts"]
