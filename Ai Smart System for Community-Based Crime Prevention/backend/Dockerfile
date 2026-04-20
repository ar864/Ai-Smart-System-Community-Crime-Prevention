FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for root and backend
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/

# Install all dependencies
RUN npm install --workspaces

# Copy backend source
COPY backend ./backend

# Build production stage
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies and built code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend

WORKDIR /app/backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start backend
CMD ["node", "src/server.js"]
