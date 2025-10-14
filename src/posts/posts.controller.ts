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

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @ApiCreatePostDocs()
  @Post()
  async createPost(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @ApiGetPostDocs()
  @Get(':id')
  async getPost(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.postsService.findPostById(id);
  }

  @ApiGetPostsDocs()
  @Get()
  async getPosts(@Query() query: PaginationQueryDto) {
    return this.postsService.findAllPosts(query);
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
