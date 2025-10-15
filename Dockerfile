# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (dev deps needed for Vite/Rollup build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/logs ./logs
COPY --from=builder /app/shared ./shared

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of app files
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:10000/api/health || exit 1

# Start the application
CMD ["npm", "start"]