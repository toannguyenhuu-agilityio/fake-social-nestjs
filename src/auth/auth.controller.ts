import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import {
  COOKIE_KEYS,
  COOKIE_HTTP_ONLY,
  COOKIE_MAX_AGE,
  COOKIE_SECURE,
} from 'src/shared/constants/cookies';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/shared/decorators/public.decorator';
import { ApiLoginDocs, ApiLogoutDocs, ApiRefreshTokenDocs } from './decorators';
import type { AuthUser } from './interfaces';
import { GetUser } from 'src/shared/decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiLoginDocs()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie(COOKIE_KEYS.ACCESS, accessToken, {
      httpOnly: COOKIE_HTTP_ONLY,
      secure: COOKIE_SECURE,
      maxAge: COOKIE_MAX_AGE.ACCESS,
    });

    res.cookie(COOKIE_KEYS.REFRESH, refreshToken, {
      httpOnly: COOKIE_HTTP_ONLY,
      secure: COOKIE_SECURE,
      maxAge: COOKIE_MAX_AGE.REFRESH,
    });

    return { message: 'Logged in successfully' };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiRefreshTokenDocs()
  @Post('refresh')
  async refresh(
    @GetUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, email } = user;
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      userId,
      email,
    );

    res.cookie(COOKIE_KEYS.ACCESS, accessToken, {
      httpOnly: COOKIE_HTTP_ONLY,
      secure: COOKIE_SECURE,
      maxAge: COOKIE_MAX_AGE.ACCESS,
    });

    res.cookie(COOKIE_KEYS.REFRESH, refreshToken, {
      httpOnly: COOKIE_HTTP_ONLY,
      secure: COOKIE_SECURE,
      maxAge: COOKIE_MAX_AGE.REFRESH,
    });

    return { message: 'Tokens refreshed' };
  }

  @Public()
  @Post('logout')
  @ApiLogoutDocs()
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_KEYS.ACCESS);
    res.clearCookie(COOKIE_KEYS.REFRESH);

    return { message: 'Logged out' };
  }
}
