import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedRequest, JwtPayload } from '../interfaces';
import { COOKIE_KEYS } from 'src/shared/constants/cookies';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (req: AuthenticatedRequest): string => {
        return (req?.cookies?.[COOKIE_KEYS.REFRESH] as string) || '';
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
    });
  }

  validate(req: AuthenticatedRequest, payload: JwtPayload) {
    const refreshToken = req?.cookies?.[COOKIE_KEYS.REFRESH] as string;

    return { userId: payload.sub, email: payload.email, refreshToken };
  }
}
