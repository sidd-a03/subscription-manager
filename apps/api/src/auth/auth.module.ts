import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './common/guards/access.guard';
import { RefreshTokenGuard } from './common/guards/refresh.guard';
import { GoogleStrategy } from './strategies/google.strategies';
import { PassportModule } from '@nestjs/passport';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    OtpModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.access_secret'),
        signOptions: {
          expiresIn: "15m"
        }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RefreshTokenGuard, GoogleStrategy],
})
export class AuthModule { }
