import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UserEntity } from '../dto/user.entity';
import { ApiInternalServerErrorResponseDecorator } from 'src/shared/decorators';
import { CreateUserDto, UpdateUserDTO } from '../dto';

const UserReponseSample = {
  id: 'c4b9f5c1-29b1-4db8-9a13-8e3e5d725c92',
  email: 'toan.nguyenhuu@asnet.com.vn',
  firstName: 'Toan',
  lastName: 'Nguyen',
};

export const ApiGetUserDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get User By ID' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'User ID (UUID format)',
      required: true,
    }),
    ApiResponse({
      status: 200,
      type: UserEntity,
      description: 'User successfully retrieved',
      example: UserReponseSample,
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiGetUsersDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get all users (paginated)' }),
    ApiResponse({
      status: 200,
      type: [UserEntity],
      description: 'Users successfully retrieved',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      example: 1,
      description: 'Page number',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      example: 10,
      description: 'Number of users per page',
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
      description: 'List of users successfully retrieved',
      type: [UserEntity],
      isArray: true,
      example: {
        data: [UserReponseSample],
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
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiCreateUserDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new user' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'User ID (UUID format)',
    }),
    ApiBody({ type: CreateUserDto }),
    ApiResponse({
      status: 201,
      type: UserEntity,
      description: 'User successfully created',
      example: UserReponseSample,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request',
    }),
    ApiResponse({ status: 409, description: 'User already exists' }),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiUpdateUserDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update a user' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'User ID (UUID format)',
    }),
    ApiBody({
      type: UpdateUserDTO,
      examples: {
        validExample: {
          summary: 'A valid update request',
          description: 'Typical payload when updating user info',
          value: {
            firstName: 'Toan 2',
            lastName: 'Nguyen 2',
            email: 'toan.nguyenhuu2@asnet.com.vn',
            password: 'strongPassword123',
          },
        },
        partialUpdateExample: {
          summary: 'Partial update',
          description: 'Only one or two fields can be updated at once',
          value: {
            firstName: 'Toan3',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      type: UserEntity,
      description: 'User successfully updated',
      example: UserReponseSample,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request',
    }),
    ApiResponse({ status: 404, description: 'User not found' }),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiDeleteUserDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a user' }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'User ID (UUID format)',
    }),
    ApiResponse({
      status: 200,
      description: 'User successfully deleted',
      example: UserReponseSample,
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
    ApiInternalServerErrorResponseDecorator(),
  );
};
