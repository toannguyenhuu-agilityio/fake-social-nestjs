import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { validatePassword } from 'src/shared/utils';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import {
  MOCK_ACCESS_TOKEN,
  MOCK_CREDENTIALS,
  MOCK_REFRESH_TOKEN,
  MOCK_USER,
} from 'src/mocks';

jest.mock('src/shared/utils', () => ({
  validatePassword: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        {
          provide: UsersService,
          useValue: {
            getUserByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get(UsersService);
    jwtService = moduleRef.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokens', () => {
    it('should return an access token and refresh token', async () => {
      usersService.getUserByEmail.mockResolvedValue(MOCK_USER);

      jwtService.signAsync
        .mockResolvedValueOnce(MOCK_ACCESS_TOKEN)
        .mockResolvedValueOnce(MOCK_REFRESH_TOKEN);

      const result = await authService.getTokens(MOCK_USER.id, MOCK_USER.email);

      expect(result).toEqual({
        accessToken: MOCK_ACCESS_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
      });
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      usersService.getUserByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@example.com', password: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw if password invalid', async () => {
      usersService.getUserByEmail.mockResolvedValue(MOCK_USER);

      (validatePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens when credentials valid', async () => {
      usersService.getUserByEmail.mockResolvedValue(MOCK_USER);

      (validatePassword as jest.Mock).mockResolvedValue(true);

      jwtService.signAsync
        .mockResolvedValueOnce(MOCK_ACCESS_TOKEN)
        .mockResolvedValueOnce(MOCK_REFRESH_TOKEN);

      const result = await authService.login(MOCK_CREDENTIALS);

      expect(result).toEqual({
        accessToken: MOCK_ACCESS_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
      });
    });
  });

  describe('refreshTokens', () => {
    it('should call getTokens with userId and email', async () => {
      jest.spyOn(authService, 'getTokens').mockResolvedValue({
        accessToken: MOCK_ACCESS_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
      });

      const result = await authService.refreshTokens('123', 'test@example.com');

      expect(result).toEqual({
        accessToken: MOCK_ACCESS_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
      });
    });
  });
});
