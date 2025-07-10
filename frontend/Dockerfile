FROM node:18-alpine

WORKDIR /app

# Copy source code
COPY . .

# Cài đặt dependencies
RUN npm install

# Build production bundle
RUN npm run build

# Cài serve để chạy static site từ dist
RUN npm install -g serve

# Expose port 3001 cho Nginx proxy tới
EXPOSE 3001

# Chạy webapp với serve
CMD ["serve", "-s", "dist", "-l", "3001"]
