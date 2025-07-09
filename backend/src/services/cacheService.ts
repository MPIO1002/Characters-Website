import redisClient from '../redis-client';

export const getCachedData = async (key: string) => {
  try {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const setCachedData = async (key: string, data: any, ttl: number = 1800) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const deleteCachedData = async (key: string) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};