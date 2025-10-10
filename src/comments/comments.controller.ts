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
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateCommentDocs,
  ApiDeleteCommentDocs,
  ApiGetCommentDocs,
  ApiUpdateCommentDocs,
} from './decorators';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @ApiCreateCommentDocs()
  @Post()
  async createComment(@Body() dto: CreateCommentDto) {
    return this.commentsService.create(dto);
  }

  @ApiGetCommentDocs()
  @Get(':id')
  async getComment(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.commentsService.findComment(id);
  }

  @ApiUpdateCommentDocs()
  @Patch(':id')
  async updateComment(@Body() dto: CreateCommentDto, @Param('id') id: string) {
    return this.commentsService.update(id, dto);
  }

  @ApiDeleteCommentDocs()
  @Delete(':id')
  async deleteComment(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.commentsService.delete(id);
  }
}
