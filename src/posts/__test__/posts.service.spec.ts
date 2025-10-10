import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../posts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto, UpdatePostDTO } from '../dtos';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MOCK_LIST_COMMENT, MOCK_LIST_POST, MOCK_POST } from 'src/mocks';
import { PaginationQueryDto } from 'src/shared/dtos';

describe('PostsService', () => {
  let service: PostsService;

  const mockPostCreate = jest.fn();
  const mockPostFindUnique = jest.fn();
  const mockUserFindUnique = jest.fn();
  const mockPostFindMany = jest.fn();
  const mockPostCount = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockCommentFindMany = jest.fn();
  const mockCommentCount = jest.fn();
  const mockTransaction = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              create: mockPostCreate,
              findUnique: mockPostFindUnique,
              findMany: mockPostFindMany,
              count: mockPostCount,
              update: mockUpdate,
              delete: mockDelete,
            },
            user: {
              findUnique: mockUserFindUnique,
            },
            comment: {
              findMany: mockCommentFindMany,
              count: mockCommentCount,
            },
            $transaction: mockTransaction,
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new post successfully', async () => {
      const dto: CreatePostDto = {
        title: 'My first post',
        content: 'Hello world',
        authorId: 'user-1',
      };
      const mockPost = {
        id: 'post-1',
        ...dto,
        createdAt: new Date('2023-08-05T12:34:56.789Z'),
      };
      mockUserFindUnique.mockResolvedValue({ id: 'user-1' });
      mockPostCreate.mockResolvedValue(mockPost);

      const result = await service.create(dto);

      expect(mockPostCreate).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(mockPost);
    });

    it('should throw ForbiddenException if author not found', async () => {
      const dto: CreatePostDto = {
        title: 'My first post',
        content: 'Hello world',
        authorId: 'user-1',
      };

      mockUserFindUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPostById', () => {
    it('should return post when found', async () => {
      mockPostFindUnique.mockResolvedValue(MOCK_POST);

      const result = await service.findPostById('post-1');

      expect(mockPostFindUnique).toHaveBeenCalledWith({
        where: { id: 'post-1' },
      });
      expect(result).toEqual(MOCK_POST);
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPostFindUnique.mockResolvedValue(null);

      await expect(service.findPostById('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllPosts', () => {
    it('should return paginated posts', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };

      mockTransaction.mockResolvedValue([2, MOCK_LIST_POST]);

      const result = await service.findAllPosts(query);

      expect(mockTransaction).toHaveBeenCalled();
      expect(result.data).toEqual(MOCK_LIST_POST);
      expect(result.meta.totalItems).toBe(2);
    });
  });

  describe('findCommentsByPost', () => {
    it('should return paginated comments for a post', async () => {
      const query = { page: 1, limit: 5, postId: 'post-1' };
      mockTransaction.mockResolvedValue([2, MOCK_LIST_COMMENT]);

      const result = await service.findCommentsByPost(query);

      expect(mockTransaction).toHaveBeenCalled();
      expect(result.data).toEqual(MOCK_LIST_COMMENT);
      expect(result.meta.totalItems).toBe(2);
    });
  });

  describe('update', () => {
    it('should update a post when user is author', async () => {
      const dto: UpdatePostDTO = { content: 'Updated content' };
      const mockPost = { id: 'p1', authorId: 'u1', content: 'Old content' };
      const updatedPost = { ...mockPost, ...dto };

      mockPostFindUnique.mockResolvedValue(mockPost);
      mockUpdate.mockResolvedValue(updatedPost);

      const result = await service.update({ id: 'p1', dto, userId: 'u1' });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: dto,
      });
      expect(result).toEqual(updatedPost);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      const mockPost = { id: 'p1', authorId: 'u2' };
      mockPostFindUnique.mockResolvedValue(mockPost);

      await expect(
        service.update({ id: 'p1', dto: { content: 'X' }, userId: 'u1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostFindUnique.mockResolvedValue(null);

      await expect(
        service.update({ id: 'p1', dto: { content: 'X' }, userId: 'u1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a post if user is author', async () => {
      const mockPost = { id: 'p1', authorId: 'u1' };
      mockPostFindUnique.mockResolvedValue(mockPost);
      mockDelete.mockResolvedValue(mockPost);

      const result = await service.delete('p1', 'u1');

      expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'p1' } });
      expect(result).toEqual(mockPost);
    });

    it('should throw ForbiddenException if user not author', async () => {
      const mockPost = { id: 'p1', authorId: 'u2' };
      mockPostFindUnique.mockResolvedValue(mockPost);

      await expect(service.delete('p1', 'u1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostFindUnique.mockResolvedValue(null);

      await expect(service.delete('p1', 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkPostExists', () => {
    it('should return post if found', async () => {
      const mockPost = { id: 'p1', content: 'Hello' };
      mockPostFindUnique.mockResolvedValue(mockPost);

      const result = await service.checkPostExists('p1');

      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPostFindUnique.mockResolvedValue(null);

      await expect(service.checkPostExists('bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
