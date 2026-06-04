// src/auth/guards/refresh-token.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    let refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        refreshToken = authHeader.substring(7);
      }
    }

    if (!refreshToken) {
      refreshToken = request.headers['x-refresh-token'];
    }
    if (!refreshToken) {
      refreshToken = request.body?.refresh_token;
    }

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refresh_secret'),
      });
      
      request['user'] = { ...payload, refreshToken };
      
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    
    return true;
  }
}