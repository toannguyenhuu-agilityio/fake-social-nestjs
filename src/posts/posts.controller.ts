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

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  async createPost(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Get(':id')
  async getPost(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.postsService.findPost(id);
  }

  @Get()
  async getPosts(@Query() query: PaginationQueryDto) {
    return this.postsService.findAll(query);
  }

  @Patch(':id')
  async updatePost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePostDTO,
  ) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  async deletePost(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.postsService.delete(id);
  }
}
