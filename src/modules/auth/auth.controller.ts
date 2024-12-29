import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { SignupRequestDto } from './dto/signup.request.dto';
import { SigninRequestDto } from './dto/signin.request.dto';
import { SigninResponseDto } from './dto/signin.response.dto';
import { AuthService } from './auth.service';
import { SignupResponseDto } from './dto/signup.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() request: SignupRequestDto): Promise<SignupResponseDto> {
    return this.authService.signup(request);
  }

  @Post('signin')
  signin(@Body() request: SigninRequestDto): Promise<SigninResponseDto> {
    return this.authService.signin(request);
  }
}
