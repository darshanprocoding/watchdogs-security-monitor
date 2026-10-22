# Multi-stage Dockerfile for WATCHDOGS Runtime Security Monitor
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Build the Vite frontend production bundle
RUN npm run build

# Production runtime container
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json ./

# Install only production dependencies + tsx runner
RUN npm install --legacy-peer-deps

# Copy built frontend assets and server files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/server ./server
COPY --from=builder /app/src/types ./src/types

EXPOSE 3000

CMD ["npm", "start"]
