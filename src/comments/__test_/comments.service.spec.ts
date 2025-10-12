import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from '../comments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from '../dtos';
import { MOCK_COMMENT } from 'src/mocks';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockFindUnique = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: {
            comment: {
              findUnique: mockFindUnique,
              create: mockCreate,
              update: mockUpdate,
              delete: mockDelete,
            },
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  describe('create', () => {
    it('should create a new comment successfully', async () => {
      const dto: CreateCommentDto = {
        content: 'Nice post!',
        authorId: 'user-123',
        postId: 'post-123',
      };

      mockCreate.mockResolvedValue(MOCK_COMMENT);

      const result = await service.create(dto);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          content: dto.content,
          post: { connect: { id: dto.postId } },
          author: { connect: { id: dto.authorId } },
        },
      });
      expect(result).toEqual(MOCK_COMMENT);
    });
  });

  describe('findComment', () => {
    it('should return a comment when found', async () => {
      const mockComment = {
        id: 'comment-1',
        content: 'Great!',
      };

      mockFindUnique.mockResolvedValue(mockComment);

      const result = await service.findComment('comment-1');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
      });
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException when comment not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(service.findComment('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a comment successfully', async () => {
      const dto: UpdateCommentDto = { content: 'Updated text' };
      const mockExisting = {
        id: 'comment-1',
        content: 'Old text',
      };
      const mockUpdated = {
        ...mockExisting,
        content: dto.content,
      };

      mockFindUnique.mockResolvedValue(mockExisting);
      mockUpdate.mockResolvedValue(mockUpdated);

      const result = await service.update('comment-1', dto, 'user-1');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
        data: { content: dto.content },
      });
      expect(result).toEqual(mockUpdated);
    });

    it('should throw NotFoundException when updating non-existing comment', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { content: 'test' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const dto: UpdateCommentDto = { content: 'Updated text' };
      const mockExisting = {
        id: 'comment-1',
        content: 'Old text',
        authorId: 'user-2',
      };

      mockFindUnique.mockResolvedValue(mockExisting);

      await expect(service.update('comment-1', dto, 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a comment successfully when user is the author', async () => {
      const mockExisting = {
        id: 'comment-1',
        content: 'To delete',
        authorId: 'user-1',
      };

      mockFindUnique.mockResolvedValue(mockExisting);
      mockDelete.mockResolvedValue(mockExisting);

      const result = await service.delete('comment-1', 'user-1');

      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
      });
      expect(result).toEqual(mockExisting);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const mockExisting = {
        id: 'comment-1',
        content: 'To delete',
        authorId: 'user-2',
      };

      mockFindUnique.mockResolvedValue(mockExisting);

      await expect(service.delete('comment-1', 'user-1')).rejects.toThrow(
        new ForbiddenException('You are not allowed to delete this comment'),
      );
    });

    it('should throw NotFoundException when deleting non-existing comment', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(service.delete('not-exist', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
