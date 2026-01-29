// Token tracking for one-time magic links and rate limiting
// Uses Upstash Redis when available, falls back to in-memory (not recommended for production)

interface TokenStore {
  isTokenUsed(token: string): Promise<boolean>;
  markTokenUsed(token: string, ttlSeconds: number): Promise<void>;
  checkRateLimit(key: string, maxRequests: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }>;
}

// In-memory fallback (WARNING: doesn't work in serverless - multiple instances don't share state)
class InMemoryTokenStore implements TokenStore {
  private usedTokens = new Map<string, number>();
  private rateLimits = new Map<string, { count: number; resetAt: number }>();

  async isTokenUsed(token: string): Promise<boolean> {
    const expiry = this.usedTokens.get(token);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.usedTokens.delete(token);
      return false;
    }
    return true;
  }

  async markTokenUsed(token: string, ttlSeconds: number): Promise<void> {
    this.usedTokens.set(token, Date.now() + ttlSeconds * 1000);
  }

  async checkRateLimit(key: string, maxRequests: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const entry = this.rateLimits.get(key);

    if (!entry || now > entry.resetAt) {
      this.rateLimits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count };
  }
}

// Upstash Redis implementation
class UpstashTokenStore implements TokenStore {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url;
    this.token = token;
  }

  private async redis(command: string[]): Promise<any> {
    const res = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });
    const data = await res.json();
    return data.result;
  }

  async isTokenUsed(token: string): Promise<boolean> {
    const result = await this.redis(['GET', `lobsta:used:${token}`]);
    return result === '1';
  }

  async markTokenUsed(token: string, ttlSeconds: number): Promise<void> {
    await this.redis(['SET', `lobsta:used:${token}`, '1', 'EX', ttlSeconds.toString()]);
  }

  async checkRateLimit(key: string, maxRequests: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
    const redisKey = `lobsta:ratelimit:${key}`;
    const count = await this.redis(['INCR', redisKey]);
    
    if (count === 1) {
      // First request, set expiry
      await this.redis(['EXPIRE', redisKey, windowSeconds.toString()]);
    }

    const allowed = count <= maxRequests;
    const remaining = Math.max(0, maxRequests - count);

    return { allowed, remaining };
  }
}

// Factory function
let store: TokenStore | null = null;

export function getTokenStore(): TokenStore {
  if (store) return store;

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    store = new UpstashTokenStore(upstashUrl, upstashToken);
    console.log('Using Upstash Redis for token storage');
  } else {
    console.warn('⚠️ UPSTASH_REDIS_REST_URL/TOKEN not set. Using in-memory token store (not suitable for serverless production)');
    store = new InMemoryTokenStore();
  }

  return store;
}
