import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CacheModule } from 'src/caching/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
