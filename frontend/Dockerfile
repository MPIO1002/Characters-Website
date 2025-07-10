FROM node:18-alpine

RUN npm install -g serve
WORKDIR /app

COPY dist ./dist

EXPOSE 3001
CMD ["serve", "-s", "dist", "-l", "3001", "/thuvientuong"]
