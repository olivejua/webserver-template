import { Body, Controller, HttpCode, Post, Headers } from '@nestjs/common';
import { SignupRequestDto } from './dto/signup.request.dto';
import { SigninRequestDto } from './dto/signin.request.dto';
import { SigninResponseDto } from './dto/signin.response.dto';
import { AuthService } from './auth.service';
import { SignupResponseDto } from './dto/signup.response.dto';
import { RefreshResponseDto } from './dto/refresh.response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/decorators/authenticated-user.decorator';
import { removeBearerFromAuthorizationHeader } from '../../common/utils/http-header.util';
import { RefreshRequestDto } from './dto/refresh.request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(201)
  @Post('signup')
  signup(@Body() request: SignupRequestDto): Promise<SignupResponseDto> {
    return this.authService.signup(request);
  }

  @Public()
  @HttpCode(200)
  @Post('signin')
  signin(@Body() request: SigninRequestDto): Promise<SigninResponseDto> {
    return this.authService.signin(request);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() request: RefreshRequestDto): Promise<RefreshResponseDto> {
    return this.authService.refresh(request);
  }

  @HttpCode(204)
  @Post('signout')
  signout(
    @Headers('authorization') authorization: string,
    @AuthenticatedUser() requestUser: any,
  ): void {
    const accessToken = removeBearerFromAuthorizationHeader(authorization);
    this.authService.signout(accessToken, requestUser.id);
  }
}
