import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import {
  MOCK_ACCESS_TOKEN,
  MOCK_CREDENTIALS,
  MOCK_REFRESH_TOKEN,
} from 'src/mocks';
import type { Request, Response } from 'express';
import {
  COOKIE_HTTP_ONLY,
  COOKIE_KEYS,
  COOKIE_MAX_AGE,
  COOKIE_SECURE,
} from 'src/shared/constants/cookies';
import { LoginDto } from '../dtos';

describe('AuthController', () => {
  let controller: AuthController;

  const mockCookie = jest.fn();
  const mockClearCookie = jest.fn();
  const mockLogin = jest.fn();
  const mockRefreshTokens = jest.fn();
  const mockLogout = jest.fn();

  const mockRes = {
    cookie: mockCookie,
    clearCookie: mockClearCookie,
  } as unknown as Response;

  const mockReq = {
    user: {
      userId: 'mockUserId',
      email: 'mockEmail@email.com',
    },
  } as unknown as Request;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: mockLogin,
            refreshTokens: mockRefreshTokens,
            logout: mockLogout,
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should set cookies for access and refresh tokens', async () => {
      const loginDto: LoginDto = MOCK_CREDENTIALS;
      mockLogin.mockResolvedValue({
        accessToken: MOCK_ACCESS_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
      });

      await controller.login(loginDto, mockRes);

      expect(mockCookie).toHaveBeenCalledWith(
        COOKIE_KEYS.ACCESS,
        MOCK_ACCESS_TOKEN,
        {
          httpOnly: COOKIE_HTTP_ONLY,
          secure: COOKIE_SECURE,
          maxAge: COOKIE_MAX_AGE.ACCESS,
        },
      );

      expect(mockCookie).toHaveBeenCalledWith(
        COOKIE_KEYS.REFRESH,
        MOCK_REFRESH_TOKEN,
        expect.objectContaining({
          httpOnly: COOKIE_HTTP_ONLY,
          secure: COOKIE_SECURE,
          maxAge: COOKIE_MAX_AGE.REFRESH,
        }),
      );
    });
  });

  describe('refresh', () => {
    it('should set cookies for access and refresh tokens', async () => {
      mockRefreshTokens.mockResolvedValue({
        accessToken: MOCK_ACCESS_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
      });

      const result = await controller.refresh(mockReq, mockRes);

      expect(mockCookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ message: 'Tokens refreshed' });
    });
  });

  describe('logout', () => {
    it('should clear cookies for access and refresh tokens', () => {
      const result = controller.logout(mockRes);

      expect(mockClearCookie).toHaveBeenCalledTimes(2);
      expect(mockClearCookie).toHaveBeenCalledWith(COOKIE_KEYS.ACCESS);
      expect(mockClearCookie).toHaveBeenCalledWith(COOKIE_KEYS.REFRESH);
      expect(result).toEqual({ message: 'Logged out' });
    });
  });
});
