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
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDTO } from './dtos';
import { PaginationQueryDto } from 'src/shared/dtos';
import type { Request } from 'express';
import {
  ApiCreatePostDocs,
  ApiDeletePostDocs,
  ApiGetCommentsByPostDocs,
  ApiGetPostDocs,
  ApiGetPostsDocs,
  ApiUpdatePostDocs,
} from './decorators';

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
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };
    const userId = user.userId;

    return this.postsService.update({ id, dto, userId });
  }

  @ApiDeletePostDocs()
  @Delete(':id')
  async deletePost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };
    const userId = user.userId;

    return this.postsService.delete(id, userId);
  }
}
