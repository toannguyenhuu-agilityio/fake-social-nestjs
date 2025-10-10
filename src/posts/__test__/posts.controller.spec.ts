import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../posts.controller';
import { PostsService } from '../posts.service';
import { CreatePostDto, UpdatePostDTO } from '../dtos';
import { MOCK_LIST_COMMENT, MOCK_LIST_POST, MOCK_POST } from 'src/mocks';
import { PaginationQueryDto } from 'src/shared/dtos';
import type { Request } from 'express';

describe('PostsController', () => {
  let controller: PostsController;

  const mockCreate = jest.fn();
  const mockGetPost = jest.fn();
  const mockFindPostById = jest.fn();
  const mockFindAllPosts = jest.fn();
  const mockFindCommentsByPost = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            create: mockCreate,
            getPost: mockGetPost,
            findPostById: mockFindPostById,
            findAllPosts: mockFindAllPosts,
            findCommentsByPost: mockFindCommentsByPost,
            update: mockUpdate,
            delete: mockDelete,
          },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create and return a post', async () => {
      const dto: CreatePostDto = {
        title: 'My first post',
        content: 'Hello world',
        authorId: 'user-123',
      };

      const mockPost = {
        id: 'post-123',
        ...dto,
      };

      mockCreate.mockResolvedValue(mockPost);

      const result = await controller.createPost(dto);

      expect(mockCreate).toHaveBeenCalledWith(dto);

      expect(result).toBe(mockPost);
    });
  });

  describe('getPost', () => {
    it('should return a post by id', async () => {
      mockFindPostById.mockResolvedValue(MOCK_POST);

      const result = await controller.getPost('post-1');

      expect(mockFindPostById).toHaveBeenCalledWith(MOCK_POST.id);
      expect(result).toEqual(MOCK_POST);
    });
  });

  describe('getPosts', () => {
    it('should return all posts with pagination', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };

      mockFindAllPosts.mockResolvedValue(MOCK_LIST_POST);

      const result = await controller.getPosts(query);

      expect(mockFindAllPosts).toHaveBeenCalledWith(query);
      expect(result).toEqual(MOCK_LIST_POST);
    });
  });

  describe('getCommentsByPost', () => {
    it('should return comments for a post', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 5 };
      const postId = 'post-123';

      mockFindCommentsByPost.mockResolvedValue(MOCK_LIST_COMMENT);

      const result = await controller.getCommentsByPost(query, postId);

      expect(mockFindCommentsByPost).toHaveBeenCalledWith({
        ...query,
        postId,
      });
      expect(result).toEqual(MOCK_LIST_COMMENT);
    });
  });

  describe('updatePost', () => {
    it('should update post for given user', async () => {
      const id = 'post-123';
      const dto: UpdatePostDTO = { content: 'Updated content' };

      const req = {
        user: { userId: 'user-1' },
      } as unknown as Request;

      const mockUpdated = {
        id,
        content: dto.content,
        authorId: 'user-1',
        createdAt: new Date('2025-10-10T12:34:56.789Z'),
        updatedAt: new Date('2025-10-10T12:34:56.789Z'),
      };

      mockUpdate.mockResolvedValue(mockUpdated);

      const result = await controller.updatePost(id, dto, req);

      expect(mockUpdate).toHaveBeenCalledWith({
        id,
        dto,
        userId: 'user-1',
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('deletePost', () => {
    it('should delete post for given user', async () => {
      const id = 'post-123';
      const req = {
        user: { userId: 'user-1' },
      } as unknown as Request;

      const mockDeleted = {
        id,
        content: 'Deleted content',
        authorId: 'user-1',
        createdAt: new Date('2025-10-10T12:34:56.789Z'),
        updatedAt: new Date('2025-10-10T12:34:56.789Z'),
      };

      mockDelete.mockResolvedValue(mockDeleted);

      const result = await controller.deletePost(id, req);

      expect(mockDelete).toHaveBeenCalledWith(id, 'user-1');
      expect(result).toEqual(mockDeleted);
    });
  });
});
