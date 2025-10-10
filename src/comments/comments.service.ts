import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dtos';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        post: {
          connect: {
            id: dto.postId,
          },
        },
        author: {
          connect: {
            id: dto.authorId,
          },
        },
      },
    });
  }

  async findComment(id: string) {
    return await this.checkCommentExists(id);
  }

  async update(id: string, dto: UpdateCommentDto) {
    await this.checkCommentExists(id);

    return this.prisma.comment.update({
      where: { id },
      data: {
        content: dto.content,
      },
    });
  }

  async delete(id: string) {
    await this.checkCommentExists(id);

    return this.prisma.comment.delete({
      where: { id },
    });
  }

  async checkCommentExists(id: string) {
    const existingComment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) throw new NotFoundException('Comment not found');

    return existingComment;
  }
}
