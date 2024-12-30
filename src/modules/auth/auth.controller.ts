import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SignupRequestDto } from './dto/signup.request.dto';
import { SigninRequestDto } from './dto/signin.request.dto';
import { SigninResponseDto } from './dto/signin.response.dto';
import { AuthService } from './auth.service';
import { SignupResponseDto } from './dto/signup.response.dto';
import { RefreshResponseDto } from './dto/refresh.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(201)
  @Post('signup')
  signup(@Body() request: SignupRequestDto): Promise<SignupResponseDto> {
    return this.authService.signup(request);
  }

  @HttpCode(200)
  @Post('signin')
  signin(@Body() request: SigninRequestDto): Promise<SigninResponseDto> {
    return this.authService.signin(request);
  }

  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() refreshToken: string): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshToken);
  }

  @HttpCode(204)
  @Post('signout')
  signout(): void {
    //엑세스, 리프레시 토큰 받아서 만료시키기
    // this.authService.signout(userId);
  }
}
