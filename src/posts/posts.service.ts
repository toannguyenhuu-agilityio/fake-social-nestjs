import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto, UpdatePostDTO } from './dtos';
import { PaginationQueryDto } from 'src/shared/dtos';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        ...dto,
      },
    });
  }

  async findPost(id: string) {
    return this.prisma.post.findUnique({ where: { id } });
  }

  async findAll({
    page,
    limit,
    orderBy = 'createdAt',
    sort = 'desc',
  }: PaginationQueryDto) {
    const skip = (page - 1) * limit;

    const [total, posts] = await this.prisma.$transaction([
      this.prisma.post.count(),
      this.prisma.post.findMany({
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

  async update(id: string, dto: UpdatePostDTO) {
    return this.prisma.post.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.post.delete({
      where: {
        id,
      },
    });
  }
}
