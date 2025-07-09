import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import redisClient from './redis-client';
import authRoutes from './auth';
import heroRoutes from './routes/heroRoutes';
import artifactRoutes from './routes/artifactRoutes';
import petRoutes from './routes/petRoutes';
import { initializeStatsSocket } from './sockets/statsSocket';
import { getStatsController } from './controllers/statsController';

dotenv.config();

const app = express();
const port = 3000;
const host = "0.0.0.0";

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3001',
    'https://monghuyen.gianhgo.me'
  ],
  credentials: true
}));

// Create HTTP server and Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3001',
      'https://monghuyen.gianhgo.me'
    ],
    credentials: true
  }
});

// Middleware
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));

// Connect to Redis
redisClient.connect();

// Routes
app.use('/heroes', heroRoutes);
app.use('/artifact_private', artifactRoutes);
app.use('/pet_private', petRoutes);
app.use('/auth', authRoutes);
app.get('/stats', getStatsController);

// Initialize Socket.IO
initializeStatsSocket(io);

// Start server
server.listen(port, host, () => {
  console.log(`Server is running on ${host}:${port}`);
});