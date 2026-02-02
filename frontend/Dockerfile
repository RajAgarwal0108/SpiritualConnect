# Frontend Dockerfile for Next.js (used by Render)
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source
COPY . ./

# Build the Next.js app
RUN npm run build

EXPOSE 3000
ENV PORT=3000

# Start using the PORT provided by the platform
CMD ["sh", "-c", "npm run start -- -p $PORT"]
