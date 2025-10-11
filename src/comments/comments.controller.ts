import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dtos';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateCommentDocs,
  ApiDeleteCommentDocs,
  ApiGetCommentDocs,
  ApiUpdateCommentDocs,
} from './decorators';
import type { Request } from 'express';

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
  async updateComment(
    @Body() dto: UpdateCommentDto,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };

    return this.commentsService.update(id, dto, user.userId);
  }

  @ApiDeleteCommentDocs()
  @Delete(':id')
  async deleteComment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };
    const userId = user.userId;

    return this.commentsService.delete(id, userId);
  }
}
