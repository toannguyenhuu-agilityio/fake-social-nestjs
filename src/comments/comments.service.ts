import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dtos';
import { PaginationQueryDto } from 'src/shared/dtos';

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

  async findAll({
    page,
    limit,
    orderBy = 'createdAt',
    sort = 'desc',
    postId,
  }: PaginationQueryDto & { postId: string }) {
    const skip = (page - 1) * limit;

    const [total, posts] = await this.prisma.$transaction([
      this.prisma.comment.count({ where: { postId } }),
      this.prisma.comment.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: { [orderBy]: sort },
      }),
    ]);

    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;

    return {
      data: posts,
      meta: {
        currentPage: page,
        totalPages: lastPage,
        itemsPerPage: limit,
        totalItems: total,
        lastPage,
        nextPage,
      },
    };
  }

  async update(id: string, dto: UpdateCommentDto) {
    return this.prisma.comment.update({
      where: { id },
      data: {
        content: dto.content,
      },
    });
  }

  async delete(id: string) {
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
