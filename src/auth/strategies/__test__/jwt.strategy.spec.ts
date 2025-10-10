import { JwtStrategy } from '../jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { COOKIE_KEYS } from 'src/shared/constants/cookies';
import { JwtPayload } from 'src/auth/interfaces';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService: ConfigService;

  const mockGet = jest.fn();

  beforeEach(() => {
    configService = {
      get: mockGet.mockReturnValue('mock-secret'),
    } as unknown as ConfigService;

    jwtStrategy = new JwtStrategy(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('jwtFromRequest', () => {
    it('should extract access token from cookies', () => {
      const mockReq: any = {
        cookies: {
          [COOKIE_KEYS.ACCESS]: 'access-token-value',
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const extractor = (jwtStrategy as any)._jwtFromRequest;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const result = extractor(mockReq);

      expect(result).toBe('access-token-value');
    });

    it('should return empty string if cookies are missing', () => {
      const mockReq: any = {}; // no cookies

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const extractor = (jwtStrategy as any)._jwtFromRequest;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const result = extractor(mockReq);

      expect(result).toBe('');
    });
  });
  describe('constructor', () => {
    it('should call ConfigService.get with JWT_SECRET', () => {
      expect(mockGet).toHaveBeenCalledWith('JWT_SECRET');
    });
  });

  describe('validate', () => {
    it('should return user object with userId and email', () => {
      const payload = {
        sub: 'user-123',
        email: 'user@example.com',
      };

      const result = jwtStrategy.validate(payload);

      expect(result).toEqual({
        userId: payload.sub,
        email: payload.email,
      });
    });

    it('should handle missing payload fields gracefully', () => {
      const payload = {} as JwtPayload;

      const result = jwtStrategy.validate(payload);

      expect(result).toEqual({ userId: undefined, email: undefined });
    });
  });
});
