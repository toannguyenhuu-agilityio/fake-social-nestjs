import { Module, Global, OnModuleInit } from '@nestjs/common';
import { CacheContext } from './cache.context';
import { RedisCacheStrategy } from './strategies/redis-cache.strategy';
import { InMemoryCacheStrategy } from './strategies/in-memory-cache.strategy';

@Global()
@Module({
  providers: [
    {
      provide: RedisCacheStrategy,
      useFactory: () => new RedisCacheStrategy('redis://localhost:6379'),
    },
    InMemoryCacheStrategy,
    CacheContext,
  ],
  exports: [CacheContext],
})
export class CacheModule implements OnModuleInit {
  constructor(private readonly cacheContext: CacheContext) {}

  async onModuleInit() {
    await this.cacheContext.init();
  }
}
