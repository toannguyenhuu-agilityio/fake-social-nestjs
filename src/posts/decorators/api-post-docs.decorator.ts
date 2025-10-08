import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { PostEntity } from '../dtos/post.entity';
import {
  ApiBadRequestResponseDecorator,
  ApiInternalServerErrorResponseDecorator,
  ApiUnauthorizedResponseDecorator,
} from 'src/shared/decorators';
import { CommentEntity } from 'src/comments/dtos';

const PostReponseSample = {
  id: 'c4b9f5c1-29b1-4db8-9a13-8e3e5d725c92',
  title: 'Post 1',
  content: 'Content of post 1',
  authorId: 'c4b9f5c1-29b1-4db8-9a13-8e3e5d725c92',
  createdAt: '2025-10-07T00:00:00.000Z',
  updatedAt: '2025-10-07T00:00:00.000Z',
};

export const ApiGetPostDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get Post By ID' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Post ID (UUID format)',
      required: true,
    }),
    ApiResponse({
      status: 200,
      type: PostEntity,
      description: 'Post successfully retrieved',
      example: PostReponseSample,
    }),
    ApiResponse({
      status: 404,
      description: 'Post not found',
    }),
    ApiUnauthorizedResponseDecorator(),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiGetPostsDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get all posts' }),
    ApiQuery({
      name: 'page',
      required: false,
      default: 1,
      example: 1,
      description: 'Page number',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      default: 10,
      example: 10,
      description: 'Number of posts per page',
    }),
    ApiQuery({
      name: 'orderBy',
      required: false,
      example: 'createdAt',
      description: 'Field to order by',
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      example: 'asc',
      description: 'Sort direction',
    }),
    ApiResponse({
      status: 200,
      type: [PostEntity],
      description: 'Posts successfully retrieved',
      example: {
        data: [PostReponseSample],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          limit: 10,
          offset: 0,
          nextPage: null,
          previousPage: null,
        },
      },
    }),
    ApiUnauthorizedResponseDecorator(),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiGetCommentsByPostDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get comments by post' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Post ID (UUID format)',
      required: true,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      default: 1,
      example: 1,
      description: 'Page number',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      default: 10,
      example: 10,
      description: 'Number of comments per page',
    }),
    ApiQuery({
      name: 'orderBy',
      required: false,
      example: 'createdAt',
      description: 'Field to order by',
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      example: 'asc',
      description: 'Sort direction',
    }),
    ApiResponse({
      status: 200,
      type: [CommentEntity],
      description: 'Comments successfully retrieved',
      example: {
        data: [CommentEntity],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          limit: 10,
          offset: 0,
          nextPage: null,
          previousPage: null,
        },
      },
    }),
    ApiUnauthorizedResponseDecorator(),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiCreatePostDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new post' }),
    ApiBody({ type: PostEntity }),
    ApiResponse({
      status: 201,
      type: PostEntity,
      description: 'Post successfully created',
      example: PostReponseSample,
    }),
    ApiBadRequestResponseDecorator(),
    ApiUnauthorizedResponseDecorator(),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiUpdatePostDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update a post' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Post ID (UUID format)',
      required: true,
    }),
    ApiBody({ type: PostEntity }),
    ApiResponse({
      status: 200,
      type: PostEntity,
      description: 'Post successfully updated',
      example: PostReponseSample,
    }),
    ApiResponse({
      status: 404,
      description: 'Post not found',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request',
    }),
    ApiUnauthorizedResponseDecorator(),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiDeletePostDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a post' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Post ID (UUID format)',
    }),
    ApiResponse({
      status: 200,
      description: 'Post successfully deleted',
      example: PostReponseSample,
    }),
    ApiResponse({
      status: 404,
      description: 'Post not found',
    }),
    ApiUnauthorizedResponseDecorator(),
    ApiInternalServerErrorResponseDecorator(),
  );
};
