# ---- Build Stage ----
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# ---- Runtime Stage ----
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Copy node_modules and source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Expose the default port
EXPOSE 3000

# Use a non‑root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the server
CMD ["node", "server.js"]
