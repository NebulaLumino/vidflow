FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/index.js"]
