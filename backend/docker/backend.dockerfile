# Use Node 20 as base image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the backend code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Default command to run
CMD ["npm", "run", "dev"]
