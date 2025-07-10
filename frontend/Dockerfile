FROM nginx:alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js for building
RUN apk add --no-cache nodejs npm

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Copy built files to nginx
COPY dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]

