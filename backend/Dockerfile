FROM oven/bun:1.3.8

WORKDIR /app

# Set Prisma engine BEFORE install/generate
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

# Copy only dependency-related files first
COPY package.json bun.lock prisma ./

# Install deps + generate Prisma client
RUN bun install
RUN bunx prisma generate

# Copy rest of the source code
COPY . .

EXPOSE 3001

CMD ["bun", "run", "index.ts"]