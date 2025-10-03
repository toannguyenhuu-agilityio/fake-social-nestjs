import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos';
import { JWT_EXPIRES_IN, JWT_SECRET } from 'src/shared/constants/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async hassPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

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
    const user = await this.usersService.getUser(dto.email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await this.validatePassword(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return this.getTokens(user.id, user.email);
  }

  async refreshTokens(userId: string, email: string) {
    return this.getTokens(userId, email);
  }
}
