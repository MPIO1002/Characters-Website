import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import config from '../components/api-config/api-config';

interface UserStats {
  online: number;
  total: number;
}

const useWebSocket = () => {
  const [stats, setStats] = useState<UserStats>({ online: 0, total: 0 });
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Tạo connection
    const baseUrl = config.apiBaseUrl.replace('/api', '');
    
    socketRef.current = io(baseUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      path: '/socket.io',
    });

    const socket = socketRef.current;

    // Event listeners
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('userStats', (data: UserStats) => {
      setStats(data);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Heartbeat để duy trì connection
    const heartbeat = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000);

    // Cleanup
    return () => {
      clearInterval(heartbeat);
      socket.disconnect();
    };
  }, []);

  return { stats, isConnected };
};

export default useWebSocket;