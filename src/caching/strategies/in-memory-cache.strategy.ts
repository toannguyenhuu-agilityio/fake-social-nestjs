import { ICacheStrategy } from '../interfaces';
import { Injectable } from '@nestjs/common';
import Keyv from 'keyv';
import { CacheableMemory } from 'cacheable';

@Injectable()
export class InMemoryCacheStrategy implements ICacheStrategy {
  private keyv: Keyv;

  constructor() {
    this.keyv = new Keyv({
      store: new CacheableMemory({ ttl: 60 * 1000 }),
    });
  }

  async get<T>(key: string): Promise<T | null> {
    return (await this.keyv.get(key)) as T | null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.keyv.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.keyv.delete(key);
  }
}
