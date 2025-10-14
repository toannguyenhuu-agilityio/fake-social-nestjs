import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto, UpdatePostDTO } from './dtos';
import { PaginationQueryDto } from 'src/shared/dtos';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePostDto) {
    const author = await this.prisma.user.findUnique({
      where: { id: dto.authorId },
    });

    if (!author) throw new NotFoundException('Author not found');

    return this.prisma.post.create({
      data: {
        ...dto,
      },
    });
  }

  async findPostById(id: string) {
    return await this.checkPostExists(id);
  }

  async findAllPosts({
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

  async findCommentsByPost({
    page,
    limit,
    orderBy = 'createdAt',
    sort = 'desc',
    postId,
  }: PaginationQueryDto & { postId: string }) {
    await this.checkPostExists(postId);

    const skip = (page - 1) * limit;

    const [total, comments] = await this.prisma.$transaction([
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
      data: comments,
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

  async update({
    id,
    dto,
    userId,
  }: {
    id: string;
    dto: UpdatePostDTO;
    userId: string;
  }) {
    const { authorId } = await this.checkPostExists(id);

    // Check the user is the author
    if (authorId && userId !== authorId)
      throw new ForbiddenException('You are not allowed to update this post');

    return this.prisma.post.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async delete(id: string, userId: string) {
    const { authorId } = await this.checkPostExists(id);

    // Check the user is the author
    if (authorId && userId !== authorId)
      throw new ForbiddenException('You are not allowed to delete this post');

    // Delete all comments related to this post first
    await this.prisma.comment.deleteMany({
      where: { postId: id },
    });

    // Recheck the post still exists (handles cascade or race)
    const stillExists = await this.prisma.post.findUnique({ where: { id } });

    if (!stillExists) throw new NotFoundException('Post already deleted');

    return this.prisma.post.delete({
      where: {
        id,
      },
    });
  }

  async checkPostExists(id: string) {
    const existingPost = await this.prisma.post.findUnique({ where: { id } });

    if (!existingPost) throw new NotFoundException('Post not found');

    return existingPost;
  }
}
