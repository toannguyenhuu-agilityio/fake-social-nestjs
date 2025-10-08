import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CommentEntity, CreateCommentDto, UpdateCommentDto } from '../dtos';
import {
  ApiBadRequestResponseDecorator,
  ApiInternalServerErrorResponseDecorator,
  ApiUnauthorizedResponseDecorator,
} from 'src/shared/decorators';

export const ApiGetCommentDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get Comment By ID' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Comment ID (UUID format)',
      required: true,
    }),
    ApiResponse({
      status: 200,
      type: CommentEntity,
      description: 'Comment successfully retrieved',
    }),
    ApiResponse({
      status: 404,
      description: 'Comment not found',
    }),
    ApiUnauthorizedResponseDecorator(),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiCreateCommentDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new comment' }),
    ApiBody({ type: CreateCommentDto }),
    ApiResponse({
      status: 201,
      type: CommentEntity,
      description: 'Comment successfully created',
    }),
    ApiBadRequestResponseDecorator(),
    ApiUnauthorizedResponseDecorator(),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiUpdateCommentDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update a comment' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Comment ID (UUID format)',
      required: true,
    }),
    ApiBody({ type: UpdateCommentDto }),
    ApiResponse({
      status: 200,
      type: CommentEntity,
      description: 'Comment successfully updated',
    }),
    ApiResponse({
      status: 404,
      description: 'Comment not found',
    }),
    ApiBadRequestResponseDecorator(),
    ApiUnauthorizedResponseDecorator(),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiDeleteCommentDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a comment' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Comment ID (UUID format)',
    }),
    ApiResponse({
      status: 200,
      description: 'Comment successfully deleted',
    }),
    ApiResponse({
      status: 404,
      description: 'Comment not found',
    }),
    ApiUnauthorizedResponseDecorator(),
    ApiInternalServerErrorResponseDecorator(),
  );
};
