import {
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

export const ApiInternalServerErrorResponseDecorator = () =>
  ApiInternalServerErrorResponse({ description: 'Internal server error' });

export const ApiUnauthorizedResponseDecorator = () =>
  ApiUnauthorizedResponse({ description: 'Invalid or missing token' });
