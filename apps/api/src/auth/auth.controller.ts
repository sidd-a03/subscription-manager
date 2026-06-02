import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { ApiConflictResponse, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post("sign-in")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sign In" })
  @ApiCreatedResponse({
    description: "User successfully signed in and tokens generated",
    type: AuthResponseDto
  })
  @ApiConflictResponse({
    description: "Invalid credentials"
  })
  signIn(@Body() signInDto: SignInDto): Promise<Tokens> {
    return this.authService.signIn(signInDto);
  }
}
