import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { ApiConflictResponse, ApiCookieAuth, ApiCreatedResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenGuard } from './common/guards/refresh.guard';
import { GetCurrentUser, GetCurrentUserId } from './common/decorators/user.decorator';
import type { Response } from 'express';
import type { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  private returnRefreshCookie(
    token: Tokens,
    res: Response
  ) {

    res.cookie("refresh_token", token.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return {
      access_token: token.access_token
    };
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' }) 
  @ApiCreatedResponse({
    description: 'User successfully registered and tokens generated.',
    type: AuthResponseDto, 
  })
  @ApiConflictResponse({ 
    description: 'User with this email already exists' 
  })
  async signUp(
    @Res({ passthrough: true }) res: Response,
    @Body() signUpDto: SignUpDto
  ) {
    const token = await this.authService.signUp(signUpDto);

    return this.returnRefreshCookie(token, res);
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("sign-in")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sign In" })
  @ApiCreatedResponse({
    description: "User successfully signed in and tokens generated",
    type: AuthResponseDto
  })
  @ApiUnauthorizedResponse({
    description: "Invalid credentials"
  })
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() signInDto: SignInDto
  ) {
    const token = await this.authService.signIn(signInDto);
    
    return this.returnRefreshCookie(token, res);
  }

  @UseGuards(RefreshTokenGuard)
  @Throttle({ refresh: { limit: 20, ttl: 60000 } })
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: "User successfully refreshed tokens",
    type: AuthResponseDto
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or expired refresh token"
  })
  @ApiOperation({ summary: "Refresh tokens" })
  @ApiCookieAuth("refresh_token")
  async refreshToken(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser("refreshToken") refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.refreshToken(userId, refreshToken);

    return this.returnRefreshCookie(token, res);
  }
}
