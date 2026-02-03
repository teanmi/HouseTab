# Use Node LTS
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm ci

# Copy backend source code
COPY . .

# Expose port
EXPOSE 3000

# Start backend
CMD ["npm", "run", "dev"]
