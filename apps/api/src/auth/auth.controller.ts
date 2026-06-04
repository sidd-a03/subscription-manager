import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { ApiConflictResponse, ApiCookieAuth, ApiCreatedResponse, ApiFoundResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenGuard } from './common/guards/refresh.guard';
import { GetCurrentUser, GetCurrentUserId } from './common/decorators/user.decorator';
import type { Response } from 'express';
import type { Tokens } from './types';
import { AuthGuard } from './common/guards/access.guard';
import { AuthGuard as GoogleAuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  private returnRefreshCookie(
    token: Tokens,
    res: Response,
    clientType: string
  ) {

    if(clientType === "mobile")
      return {
        access_token: token.access_token,
        refresh_token: token.refresh_token
      }

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
    @Body() signUpDto: SignUpDto,
    @Headers('x-client-type') clientType: string
  ) {
    const token = await this.authService.signUp(signUpDto);

    return this.returnRefreshCookie(token, res, clientType);
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
    @Body() signInDto: SignInDto,
    @Headers('x-client-type') clientType: string
  ) {
    const token = await this.authService.signIn(signInDto);
    
    return this.returnRefreshCookie(token, res, clientType);
  }

  @UseGuards(AuthGuard)
  @Throttle({ auth: { limit: 5, ttl: 60000 }})
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout" })
  @ApiCreatedResponse({
    description: "User successfully logged out"
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or expired access token"
  })
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
    @Headers('x-client-type') clientType: string
  ) {
    const token = await this.authService.refreshToken(userId, refreshToken);

    return this.returnRefreshCookie(token, res, clientType);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard("google"))
  @HttpCode(HttpStatus.OK)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard("google"))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiFoundResponse({
    description: 'Successfully authenticated via Google. Redirects the user to the frontend dashboard with the access token in query parameters and sets the refresh token in an HTTP-only cookie.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication failed or unauthorized.',
  })
  async googleAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-client-type') clientType: string
  ) {
    const frontendUrl = process.env.FRONTEND_URL;
    
    try {
      const token = await this.authService.googleLogIn(req.user);

      this.returnRefreshCookie(token, res, clientType);

      return res.redirect(`${frontendUrl}/auth/callback?token=${token.access_token}`);
    } catch (error) {
      if(error.message === "EmailAlreadyInUse") {
        res.clearCookie("refresh_token");
        return res.redirect(`${frontendUrl}/sign-in?error=email_exists`);
      }

      return res.redirect(`${frontendUrl}/sign-in?error=oauth_failed`);
    }
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Forgot password" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return this.authService.forgotPassword(email);
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify OTP" })
  @ApiCreatedResponse({ description: "OTP successfully verified" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired OTP" })
  verifyOtp(@Body() data: VerifyOtpDto): { verified: boolean } {
    return this.authService.verifyOtp(data);
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password" })
  @ApiCreatedResponse({ description: "Password reset successfully" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired verification token" })
  async resetPassword(@Body() resetData: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(resetData);
  }
}
