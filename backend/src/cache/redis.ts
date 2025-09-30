import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function connectRedis(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.on('connect', () => console.log('Redis Client Connected'));

  await redisClient.connect();
  return redisClient;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redisClient;
}

export async function setCache(key: string, value: any, expireSeconds?: number): Promise<void> {
  if (!isRedisAvailable()) return;
  
  try {
    const client = getRedisClient();
    if (!client) return;
    
    const serialized = JSON.stringify(value);
    if (expireSeconds) {
      await client.setEx(key, expireSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!isRedisAvailable()) return null;
  
  try {
    const client = getRedisClient();
    if (!client) return null;
    
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!isRedisAvailable()) return;
  
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function clearCache(pattern: string): Promise<void> {
  if (!isRedisAvailable()) return;
  
  try {
    const client = getRedisClient();
    if (!client) return;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}
