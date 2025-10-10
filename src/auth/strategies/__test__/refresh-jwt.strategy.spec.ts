import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RefreshJwtStrategy } from '../refresh-jwt.strategy';
import { COOKIE_KEYS } from 'src/shared/constants/cookies';
import { AuthenticatedRequest, JwtPayload } from '../../interfaces';

describe('RefreshJwtStrategy', () => {
  let strategy: RefreshJwtStrategy;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') return 'mock_refresh_secret';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshJwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<RefreshJwtStrategy>(RefreshJwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should call ConfigService.get with JWT_REFRESH_SECRET', () => {
    expect(mockConfigService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
  });

  it('should extract refresh token from cookies', () => {
    const mockReq = {
      cookies: {
        [COOKIE_KEYS.REFRESH]: 'refresh_token_123',
      },
    } as unknown as AuthenticatedRequest;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const extractedToken = strategy['_jwtFromRequest'](mockReq);

    expect(extractedToken).toBe('refresh_token_123');
  });

  it('should return empty string if no cookie', () => {
    const mockReq = {} as AuthenticatedRequest;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const jwtFromRequest = (strategy as any)._jwtFromRequest;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const token = jwtFromRequest(mockReq);

    expect(token).toBe('');
  });

  it('should validate payload and return user object', () => {
    const mockReq = {
      cookies: {
        [COOKIE_KEYS.REFRESH]: 'refresh_token_123',
      },
    } as unknown as AuthenticatedRequest;

    const mockPayload: JwtPayload = {
      sub: 'user-123',
      email: 'john@example.com',
    };

    const result = strategy.validate(mockReq, mockPayload);

    expect(result).toEqual({
      userId: 'user-123',
      email: 'john@example.com',
      refreshToken: 'refresh_token_123',
    });
  });
});
