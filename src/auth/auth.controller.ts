import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import {
  COOKIE_KEYS,
  COOKIE_HTTP_ONLY,
  COOKIE_MAX_AGE,
  COOKIE_SECURE,
} from 'src/shared/constants/cookies';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ApiInternalServerErrorResponseDecorator,
  ApiUnauthorizedResponseDecorator,
} from 'src/shared/decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login (sets JWT in cookies)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successfully, JWT cookies set',
  })
  @ApiUnauthorizedResponseDecorator()
  @ApiInternalServerErrorResponseDecorator()
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);
    console.log('accessToken', accessToken);
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
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @ApiOperation({ summary: 'User refresh tokens (sets JWT in cookies)' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed, JWT cookies set',
  })
  @ApiUnauthorizedResponseDecorator()
  @ApiInternalServerErrorResponseDecorator()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, email } = req.user as { userId: string; email: string };

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

  @Post('logout')
  @ApiOperation({ summary: 'User logout (clears JWT cookies)' })
  @ApiResponse({
    status: 200,
    description: 'Logout successfully, JWT cookies cleared',
  })
  @ApiInternalServerErrorResponseDecorator()
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_KEYS.ACCESS);
    res.clearCookie(COOKIE_KEYS.REFRESH);

    return { message: 'Logged out' };
  }
}
