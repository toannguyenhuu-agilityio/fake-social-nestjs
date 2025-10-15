import { ICacheStrategy } from '../interfaces';
import { Injectable, Logger } from '@nestjs/common';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

@Injectable()
export class RedisCacheStrategy implements ICacheStrategy {
  private readonly logger = new Logger(RedisCacheStrategy.name);
  private keyv: Keyv;
  private isConnected: boolean = false;

  constructor(private readonly redisUrl: string) {
    const redisStore = new KeyvRedis(this.redisUrl, {
      throwOnConnectError: false,
    });

    this.keyv = new Keyv({
      store: redisStore,
      namespace: 'app-cache',
    });

    this.keyv.on('error', (err) => {
      this.logger.error('Redis connection error', err);
      this.isConnected = false;
    });
  }

  async connect() {
    try {
      // Keyv connects lazily; we can test by setting a temp key
      await this.keyv.set('__test__', 'ok', 1000);

      this.isConnected = true;
      this.logger.log('Redis connected');
    } catch (error) {
      this.logger.warn('Redis connection error', error);
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    const value = (await this.keyv.get(key)) as string | null;

    this.logger.debug(`GET ${key}: ${JSON.stringify(value)}`);

    return value as T | null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.isConnected) return;

    await this.keyv.set(key, value, ttl);

    this.logger.debug(`SET ${key}: ${JSON.stringify(value)} (ttl=${ttl})`);
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected) return;

    await this.keyv.delete(key);
  }

  isAvailable(): boolean {
    return this.isConnected;
  }
}
