import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  cookies: {
    access_token?: string;
    refresh_token?: string;
  };
}
