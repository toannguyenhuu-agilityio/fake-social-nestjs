import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { CreateCommentDto } from '../dtos';
import { MOCK_COMMENT } from 'src/mocks';
import type { Request } from 'express';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthUser } from 'src/auth/interfaces';

describe('CommentsController', () => {
  let controller: CommentsController;

  const mockCreate = jest.fn();
  const mockFindComment = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockCheckCommentExists = jest.fn();
  const mockCommentFindUnique = jest.fn();

  const dto: CreateCommentDto = {
    content: 'Updated comment!',
    authorId: 'user-uuid',
    postId: 'post-uuid',
  };

  const req = {
    userId: 'user-1',
  } as AuthUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: mockCreate,
            findComment: mockFindComment,
            update: mockUpdate,
            delete: mockDelete,
            checkCommentExists: mockCheckCommentExists,
          },
        },
        {
          provide: PrismaService,
          useValue: {
            comment: {
              findUnique: mockCommentFindUnique,
            },
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should call service.create() and return created comment', async () => {
      const dto: CreateCommentDto = {
        content: 'Nice post!',
        authorId: 'user-uuid',
        postId: 'post-uuid',
      };

      mockCreate.mockResolvedValue(MOCK_COMMENT);

      const result = await controller.createComment(dto);

      expect(mockCreate).toHaveBeenCalledWith(dto);
      expect(result).toEqual(MOCK_COMMENT);
    });
  });

  describe('getComment', () => {
    it('should call service.findComment() and return the comment', async () => {
      mockFindComment.mockResolvedValue(MOCK_COMMENT);

      const result = await controller.getComment('comment-uuid');

      expect(mockFindComment).toHaveBeenCalledWith('comment-uuid');
      expect(result).toEqual(MOCK_COMMENT);
    });
  });

  describe('updateComment', () => {
    it('should call service.update() and return updated comment', async () => {
      const dto: CreateCommentDto = {
        content: 'Updated comment!',
        authorId: 'user-uuid',
        postId: 'post-uuid',
      };

      const mockUpdatedComment = {
        id: 'comment-uuid',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUpdate.mockResolvedValue(mockUpdatedComment);

      const result = await controller.updateComment(dto, 'comment-uuid', req);

      expect(mockUpdate).toHaveBeenCalledWith('comment-uuid', dto, 'user-1');
      expect(result).toEqual(mockUpdatedComment);
    });

    it('should throw NotFoundException when updating non-existing comment', async () => {
      mockUpdate.mockRejectedValue(new NotFoundException('Comment not found'));

      await expect(
        controller.updateComment(dto, 'comment-uuid', req),
      ).rejects.toThrow(new NotFoundException('Comment not found'));
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      mockUpdate.mockRejectedValue(
        new ForbiddenException('You are not allowed to update this comment'),
      );

      await expect(
        controller.updateComment(dto, 'comment-uuid', req),
      ).rejects.toThrow(
        new ForbiddenException('You are not allowed to update this comment'),
      );
    });
  });

  describe('deleteComment', () => {
    it('should call service.delete() and return deleted comment', async () => {
      const mockDeletedComment = {
        id: 'comment-uuid',
        content: 'Deleted comment',
        authorId: 'user-uuid',
        postId: 'post-uuid',
      };

      mockDelete.mockResolvedValue(mockDeletedComment);

      const result = await controller.deleteComment('comment-uuid', req);

      expect(mockDelete).toHaveBeenCalledWith('comment-uuid', 'user-1');
      expect(result).toEqual(mockDeletedComment);
    });

    it('should throw NotFoundException when deleting non-existing comment', async () => {
      mockDelete.mockRejectedValue(new NotFoundException('Comment not found'));

      await expect(
        controller.deleteComment('comment-uuid', req),
      ).rejects.toThrow(new NotFoundException('Comment not found'));
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      mockDelete.mockRejectedValue(
        new ForbiddenException('You are not allowed to delete this comment'),
      );

      await expect(
        controller.deleteComment('comment-uuid', req),
      ).rejects.toThrow(
        new ForbiddenException('You are not allowed to delete this comment'),
      );
    });
  });
});
