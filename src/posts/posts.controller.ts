import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDTO } from './dtos';
import { PaginationQueryDto } from 'src/shared/dtos';
import {
  ApiCreatePostDocs,
  ApiDeletePostDocs,
  ApiGetCommentsByPostDocs,
  ApiGetPostDocs,
  ApiGetPostsDocs,
  ApiUpdatePostDocs,
} from './decorators';
import type { AuthUser } from 'src/auth/interfaces';
import { GetUser } from 'src/shared/decorators';
import { CacheContext } from 'src/caching/cache.context';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private cache: CacheContext,
  ) {}

  @ApiCreatePostDocs()
  @Post()
  async createPost(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @ApiGetPostDocs()
  @Get(':id')
  async getPost(@Param('id', new ParseUUIDPipe()) id: string) {
    const cached = await this.cache.get(`post_${id}`);
    if (cached) return cached;

    const post = await this.postsService.findPostById(id);

    await this.cache.set(`post_${id}`, post, 60000);

    return post;
  }

  @ApiGetPostsDocs()
  @Get()
  async getPosts(@Query() query: PaginationQueryDto) {
    const cached = await this.cache.get('all_posts');
    if (cached) return cached;

    const posts = await this.postsService.findAllPosts(query);

    await this.cache.set('all_posts', posts, 60000);

    return posts;
  }

  @ApiGetCommentsByPostDocs()
  @Get(':postId/comments')
  async getCommentsByPost(
    @Query() query: PaginationQueryDto,
    @Param('postId') postId: string,
  ) {
    return this.postsService.findCommentsByPost({
      ...query,
      postId,
    });
  }

  @ApiUpdatePostDocs()
  @Patch(':id')
  async updatePost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePostDTO,
    @GetUser() user: AuthUser,
  ) {
    const userId = user.userId;

    return this.postsService.update({ id, dto, userId });
  }

  @ApiDeletePostDocs()
  @Delete(':id')
  async deletePost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @GetUser() user: AuthUser,
  ) {
    const userId = user.userId;

    return this.postsService.delete(id, userId);
  }
}
