import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { JWT_EXPIRES_IN, JWT_SECRET } from 'src/shared/constants/jwt';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: JWT_SECRET.ACCESS,
      signOptions: { expiresIn: JWT_EXPIRES_IN.ACCESS },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy],
})
export class AuthModule {}
