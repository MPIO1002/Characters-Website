FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve globally
RUN npm install -g serve

EXPOSE 3001
CMD ["serve", "-s", "dist", "-l", "3001"]

