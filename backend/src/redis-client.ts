import { createClient } from 'redis';

const redisClient = createClient({
  url: 'redis://redis-mhgh:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export default redisClient;