import {
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

export const ApiInternalServerErrorResponseDecorator = () =>
  ApiInternalServerErrorResponse({ description: 'Internal server error' });

export const ApiUnauthorizedResponseDecorator = () =>
  ApiUnauthorizedResponse({ description: 'Invalid or missing token' });

export const ApiBadRequestResponseDecorator = (message?: string) =>
  ApiBadRequestResponse({
    description: message || 'Invalid field formats',
  });
