import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../dtos';
import {
  ApiBadRequestResponseDecorator,
  ApiInternalServerErrorResponseDecorator,
  ApiUnauthorizedResponseDecorator,
} from 'src/shared/decorators';

export const ApiLoginDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'User login (sets JWT in cookies)',
      description: 'Returns JWTs in cookies.',
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'Login successfully, JWT cookies set',
    }),
    ApiBadRequestResponseDecorator('Invalid email or password'),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiRefreshTokenDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'User refresh token (sets JWT in cookies)',
      description:
        'Requires valid refresh_token cookie. Returns new JWTs in cookies.',
    }),
    ApiResponse({
      status: 200,
      description: 'Refresh token successfully, JWT cookies set',
    }),
    ApiBadRequestResponseDecorator('Invalid refresh token'),
    ApiUnauthorizedResponseDecorator(),
    ApiInternalServerErrorResponseDecorator(),
  );
};

export const ApiLogoutDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'User logout (clears JWT cookies)',
      description: 'Clears JWT cookies',
    }),
    ApiResponse({
      status: 200,
      description: 'Logout successfully, JWT cookies cleared',
    }),
    ApiInternalServerErrorResponseDecorator(),
  );
};
