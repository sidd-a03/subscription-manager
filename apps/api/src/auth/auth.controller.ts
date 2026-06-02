import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { ApiConflictResponse, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('sign-up')
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
}
