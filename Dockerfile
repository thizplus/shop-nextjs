# Stage 1: Building the code
FROM node:20-alpine AS builder

WORKDIR /app

# Add build arguments
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_STORE_URL
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_SITE_CODE

# Set environment variables
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    NEXT_PUBLIC_STORE_URL=$NEXT_PUBLIC_STORE_URL \
    NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME \
    NEXT_PUBLIC_SITE_CODE=$NEXT_PUBLIC_SITE_CODE

# เพิ่ม dependencies ที่จำเป็น
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./
COPY . .

# Install dependencies with legacy peer deps flag
RUN npm ci --legacy-peer-deps

# Build project
RUN npm run build

# Stage 2: Run the built application
FROM node:20-alpine AS runner

WORKDIR /app

# Environment variables ในรูปแบบใหม่
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Copy project specific files/folders based on your imports
COPY --from=builder /app/src/components ./src/components
COPY --from=builder /app/src/@core ./src/@core
COPY --from=builder /app/src/@layouts ./src/@layouts
COPY --from=builder /app/src/views ./src/views

EXPOSE 5001

# Start the application
CMD ["npm", "start"]
