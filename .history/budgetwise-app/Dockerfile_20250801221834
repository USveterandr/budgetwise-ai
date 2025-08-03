# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the React application using Nginx
FROM nginx:alpine AS serve

# Install required system libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Copy Nginx configuration
COPY serve.conf /etc/nginx/conf.d/default.conf

# Copy the built application
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Final setup with MongoDB
FROM mongo:4.4.19 AS mongodb

# Create data directory
RUN mkdir -p /data/db

# Expose MongoDB port
EXPOSE 27017

# Start MongoDB with authentication
CMD ["mongod", "--auth", "--dbpath=/data/db", "--bind_ip_all"]

# Healthcheck for MongoDB
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=5 \
  CMD mongo admin --eval 'db.command("ping")' > /dev/null 2>&1
