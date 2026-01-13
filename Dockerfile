FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci

COPY . .

# Build the application for web
RUN npm run build

# Cloud Run sets the PORT environment variable (default 8080)
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the Express server that serves the static build
CMD ["node", "server.js"]
