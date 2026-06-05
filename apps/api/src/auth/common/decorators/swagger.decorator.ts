import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthResponseDto } from '../../dto/auth-response.dto';

export const XClientTypeHeader = () =>
  ApiHeader({
    name: 'x-client-type',
    description:
      'Client type. Pass "mobile" to receive refresh_token in response body instead of a cookie.',
    required: false,
    schema: { type: 'string', enum: ['web', 'mobile'] },
  });

export function ApiSignUp() {
  return applyDecorators(
    XClientTypeHeader(),
    ApiOperation({ summary: 'Register a new user' }),
    ApiCreatedResponse({
      description: 'User successfully registered and tokens generated.',
      type: AuthResponseDto,
    }),
    ApiConflictResponse({
      description: 'User with this email already exists',
    }),
  );
}

export function ApiSignIn() {
  return applyDecorators(
    XClientTypeHeader(),
    ApiOperation({ summary: 'Sign In' }),
    ApiOkResponse({
      description: 'User successfully signed in and tokens generated',
      type: AuthResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid credentials',
    }),
  );
}

export function ApiLogout() {
  return applyDecorators(
    XClientTypeHeader(),
    ApiOperation({ summary: 'Logout' }),
    ApiOkResponse({
      description: 'User successfully logged out',
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired access token',
    }),
  );
}

export function ApiRefreshToken() {
  return applyDecorators(
    XClientTypeHeader(),
    ApiOperation({ summary: 'Refresh tokens' }),
    ApiOkResponse({
      description: 'User successfully refreshed tokens',
      type: AuthResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired refresh token',
    }),
    ApiCookieAuth('refresh_token'),
  );
}

export function ApiGoogleAuthRedirect() {
  return applyDecorators(
    ApiOperation({ summary: 'Google OAuth callback' }),
    ApiFoundResponse({
      description:
        'Successfully authenticated via Google. Redirects the user to the frontend dashboard with the access token in query parameters and sets the refresh token in an HTTP-only cookie.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication failed or unauthorized.',
    }),
  );
}

export function ApiForgotPassword() {
  return applyDecorators(
    ApiOperation({ summary: 'Forgot password' }),
    ApiOkResponse({ description: 'OTP code sent to email if account exists' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function ApiVerifyOtp() {
  return applyDecorators(
    ApiOperation({ summary: 'Verify OTP' }),
    ApiOkResponse({ description: 'OTP successfully verified' }),
    ApiUnauthorizedResponse({ description: 'Invalid or expired OTP' }),
  );
}

export function ApiResetPassword() {
  return applyDecorators(
    ApiOperation({ summary: 'Reset password' }),
    ApiOkResponse({ description: 'Password reset successfully' }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired verification token',
    }),
  );
}
