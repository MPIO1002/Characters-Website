FROM node:18-alpine

WORKDIR /app

# Install serve globally first
RUN npm install -g serve

# Copy pre-built dist folder
COPY dist ./dist

EXPOSE 3001
CMD ["serve", "-s", "dist", "-l", "3001", "-d"]

