import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from 'src/auth/interfaces';

/**
 * Custom decorator to extract user from request.
 * Example usage: @GetUser() user: AuthUser
 */
export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return request.user as AuthUser;
  },
);
