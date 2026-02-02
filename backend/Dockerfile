FROM oven/bun:1.0

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

# Generate Prisma client
RUN bunx prisma generate

EXPOSE 3001

CMD ["bun", "run", "index.ts"]
