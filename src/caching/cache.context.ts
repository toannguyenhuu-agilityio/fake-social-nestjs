import { Injectable, Logger } from '@nestjs/common';
import { ICacheStrategy } from './interfaces';
import { RedisCacheStrategy } from './strategies/redis-cache.strategy';
import { InMemoryCacheStrategy } from './strategies';

@Injectable()
export class CacheContext {
  private strategy: ICacheStrategy;
  private readonly logger = new Logger(CacheContext.name);

  constructor(
    private readonly redisStrategy: RedisCacheStrategy,
    private readonly memoryStrategy: InMemoryCacheStrategy,
  ) {}

  async init() {
    await this.redisStrategy.connect();

    if (this.redisStrategy.isAvailable()) {
      this.strategy = this.redisStrategy;
      this.logger.log('Using redis cache');
    } else {
      this.strategy = this.memoryStrategy;
      this.logger.log('Using in-memory cache');
    }
  }

  get<T>(key: string) {
    return this.strategy.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return this.strategy.set<T>(key, value, ttl);
  }

  del(key: string): Promise<void> {
    return this.strategy.delete(key);
  }
}
