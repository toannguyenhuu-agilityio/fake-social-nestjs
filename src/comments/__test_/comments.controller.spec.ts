import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { CreateCommentDto } from '../dtos';
import { MOCK_COMMENT } from 'src/mocks';

describe('CommentsController', () => {
  let controller: CommentsController;

  const mockCreate = jest.fn();
  const mockFindComment = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockCheckCommentExists = jest.fn();

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

      const result = await controller.updateComment(dto, 'comment-uuid');

      expect(mockUpdate).toHaveBeenCalledWith('comment-uuid', dto);
      expect(result).toEqual(mockUpdatedComment);
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

      const result = await controller.deleteComment('comment-uuid');

      expect(mockDelete).toHaveBeenCalledWith('comment-uuid');
      expect(result).toEqual(mockDeletedComment);
    });
  });
});
