import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';
import type { Request, Response, NextFunction } from 'express';

// In-memory fallback cache and rate limit store for when Redis is unavailable/offline
class MemoryStore {
  private cache = new Map<string, { value: any; expiry: number }>();
  private rateLimits = new Map<string, { count: number; resetTime: number }>();

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key: string, value: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key: string) {
    this.cache.delete(key);
  }

  checkRateLimit(key: string, limit: number, windowSeconds: number): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const record = this.rateLimits.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + windowSeconds * 1000,
      });
      return { allowed: true, remaining: limit - 1, resetIn: windowSeconds };
    }

    if (record.count >= limit) {
      const resetIn = Math.ceil((record.resetTime - now) / 1000);
      return { allowed: false, remaining: 0, resetIn };
    }

    record.count += 1;
    const resetIn = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: true, remaining: limit - record.count, resetIn };
  }
}

const memoryStore = new MemoryStore();

// Upstash REST Client (ideal for serverless and HTTP environments)
let upstashClient: UpstashRedis | null = null;
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('your-upstash-url')
) {
  try {
    upstashClient = new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('[Redis] Initialized Upstash REST Client');
  } catch (err: any) {
    console.warn('[Redis] Failed to initialize Upstash REST client:', err.message);
  }
}

// ioredis client (ideal for BullMQ, persistent TCP/TLS connections)
let ioRedisClient: Redis | null = null;
const redisTcpUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
if (
  redisTcpUrl &&
  !redisTcpUrl.includes('your-upstash-url') &&
  !redisTcpUrl.includes('placeholder')
) {
  try {
    ioRedisClient = new Redis(redisTcpUrl, {
      maxRetriesPerRequest: null,
      connectTimeout: 3000,
    });
    ioRedisClient.on('error', (err) => {
      console.warn('[Redis] ioredis connection warning:', err.message);
    });
    console.log('[Redis] Initialized ioredis TCP/TLS connection');
  } catch (err: any) {
    console.warn('[Redis] Failed to initialize ioredis connection:', err.message);
  }
}

/**
 * Cache GET helper
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  try {
    if (upstashClient) {
      const data = await upstashClient.get<T>(key);
      if (data !== null && data !== undefined) return data;
    } else if (ioRedisClient && ioRedisClient.status === 'ready') {
      const data = await ioRedisClient.get(key);
      if (data) return JSON.parse(data);
    }
  } catch (err: any) {
    console.warn(`[Redis Cache] GET error for key ${key}:`, err.message);
  }
  // Fallback to in-memory store
  return memoryStore.get(key);
}

/**
 * Cache SET helper with TTL in seconds
 */
export async function cacheSet(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  try {
    if (upstashClient) {
      await upstashClient.set(key, value, { ex: ttlSeconds });
      return;
    } else if (ioRedisClient && ioRedisClient.status === 'ready') {
      await ioRedisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    }
  } catch (err: any) {
    console.warn(`[Redis Cache] SET error for key ${key}:`, err.message);
  }
  // Fallback to in-memory store
  memoryStore.set(key, value, ttlSeconds);
}

/**
 * Cache DEL helper
 */
export async function cacheDel(key: string): Promise<void> {
  try {
    if (upstashClient) {
      await upstashClient.del(key);
      return;
    } else if (ioRedisClient && ioRedisClient.status === 'ready') {
      await ioRedisClient.del(key);
      return;
    }
  } catch (err: any) {
    console.warn(`[Redis Cache] DEL error for key ${key}:`, err.message);
  }
  // Fallback to in-memory store
  memoryStore.del(key);
}

/**
 * High-performance Express Rate Limiting Middleware powered by Upstash / Redis
 */
export function rateLimiter(options: {
  limit: number;
  windowSeconds: number;
  prefix?: string;
}) {
  const { limit, windowSeconds, prefix = 'ratelimit' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Generate key based on authenticated user ID or client IP
    const clientIdentifier = (req as any).user?.id || req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${prefix}:${clientIdentifier}`;

    try {
      if (upstashClient) {
        // Atomic increment + expire in Upstash
        const count = await upstashClient.incr(key);
        if (count === 1) {
          await upstashClient.expire(key, windowSeconds);
        }
        const ttl = await upstashClient.ttl(key);

        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));
        res.setHeader('X-RateLimit-Reset', ttl);

        if (count > limit) {
          return res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Please retry after ${ttl} seconds.`,
            retryAfter: ttl,
          });
        }
        return next();
      } else if (ioRedisClient && ioRedisClient.status === 'ready') {
        const count = await ioRedisClient.incr(key);
        if (count === 1) {
          await ioRedisClient.expire(key, windowSeconds);
        }
        const ttl = await ioRedisClient.ttl(key);

        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));
        res.setHeader('X-RateLimit-Reset', ttl);

        if (count > limit) {
          return res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Please retry after ${ttl} seconds.`,
            retryAfter: ttl,
          });
        }
        return next();
      }
    } catch (err: any) {
      console.warn(`[RateLimiter] Redis error on ${key}, falling back to memory:`, err.message);
    }

    // In-memory fallback
    const result = memoryStore.checkRateLimit(key, limit, windowSeconds);
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetIn);

    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please retry after ${result.resetIn} seconds.`,
        retryAfter: result.resetIn,
      });
    }

    next();
  };
}

export { upstashClient, ioRedisClient, memoryStore };
