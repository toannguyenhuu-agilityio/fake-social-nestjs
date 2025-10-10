import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { LoginDto } from './dtos';
import { JWT_EXPIRES_IN, JWT_SECRET } from 'src/shared/constants/jwt';
import { validatePassword } from 'src/shared/utils';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: JWT_SECRET.ACCESS, expiresIn: JWT_EXPIRES_IN.ACCESS },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: JWT_SECRET.REFRESH, expiresIn: JWT_EXPIRES_IN.REFRESH },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.getUserByEmail(dto.email);

    const isPasswordValid = await validatePassword(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return this.getTokens(user.id, user.email);
  }

  async refreshTokens(userId: string, email: string) {
    return this.getTokens(userId, email);
  }
}
