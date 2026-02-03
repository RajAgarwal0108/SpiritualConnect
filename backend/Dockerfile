FROM oven/bun:1.0

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

# Generate Prisma client at build time
RUN bunx prisma generate

EXPOSE 3001

# Start the application using the start script that ensures prisma generate runs at start too
CMD ["bun", "run", "start"]
