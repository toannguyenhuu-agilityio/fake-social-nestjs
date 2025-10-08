import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dtos';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  async createComment(@Body() dto: CreateCommentDto) {
    return this.commentsService.create(dto);
  }

  @Get(':id')
  async getComment(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.commentsService.findComment(id);
  }

  @Patch(':id')
  async updateComment(@Body() dto: CreateCommentDto, @Param('id') id: string) {
    return this.commentsService.update(id, dto);
  }

  @Delete(':id')
  async deleteComment(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.commentsService.delete(id);
  }
}
