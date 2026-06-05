import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenGuard } from './common/guards/refresh.guard';
import {
  GetCurrentUser,
  GetCurrentUserId,
} from './common/decorators/user.decorator';
import type { Response } from 'express';
import type { Tokens } from './types';
import { AuthGuard } from './common/guards/access.guard';
import { AuthGuard as GoogleAuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ApiSignUp,
  ApiSignIn,
  ApiLogout,
  ApiRefreshToken,
  ApiGoogleAuthRedirect,
  ApiForgotPassword,
  ApiVerifyOtp,
  ApiResetPassword,
} from './common/decorators/swagger.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private returnRefreshCookie(
    token: Tokens,
    res: Response,
    clientType: string,
  ) {
    if (clientType === 'mobile')
      return {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
      };

    res.cookie('refresh_token', token.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: token.access_token,
    };
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiSignUp()
  async signUp(
    @Res({ passthrough: true }) res: Response,
    @Body() signUpDto: SignUpDto,
    @Headers('x-client-type') clientType: string,
  ) {
    const token = await this.authService.signUp(signUpDto);

    return this.returnRefreshCookie(token, res, clientType);
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiSignIn()
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() signInDto: SignInDto,
    @Headers('x-client-type') clientType: string,
  ) {
    const token = await this.authService.signIn(signInDto);

    return this.returnRefreshCookie(token, res, clientType);
  }

  @UseGuards(AuthGuard)
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiLogout()
  async logout(
    @GetCurrentUserId() userId: string,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-client-type') clientType: string,
  ): Promise<{ message: string }> {
    if (clientType !== 'mobile') {
      res.clearCookie('refresh_token');
    }
    return this.authService.logout(userId);
  }

  @UseGuards(RefreshTokenGuard)
  @Throttle({ refresh: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiRefreshToken()
  async refreshToken(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-client-type') clientType: string,
  ) {
    const token = await this.authService.refreshToken(userId, refreshToken);

    return this.returnRefreshCookie(token, res, clientType);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard('google'))
  @HttpCode(HttpStatus.OK)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard('google'))
  @HttpCode(HttpStatus.OK)
  @ApiGoogleAuthRedirect()
  async googleAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-client-type') clientType: string,
  ) {
    const frontendUrl = process.env.FRONTEND_URL;

    try {
      const token = await this.authService.googleLogIn(req.user);

      this.returnRefreshCookie(token, res, clientType);

      return res.redirect(
        `${frontendUrl}/auth/callback?token=${token.access_token}`,
      );
    } catch (error) {
      if (error.message === 'EmailAlreadyInUse') {
        res.clearCookie('refresh_token');
        return res.redirect(`${frontendUrl}/sign-in?error=email_exists`);
      }

      return res.redirect(`${frontendUrl}/sign-in?error=oauth_failed`);
    }
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiForgotPassword()
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return this.authService.forgotPassword(email);
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiVerifyOtp()
  verifyOtp(@Body() data: VerifyOtpDto): { verified: boolean } {
    return this.authService.verifyOtp(data);
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiResetPassword()
  async resetPassword(
    @Body() resetData: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetData);
  }
}
