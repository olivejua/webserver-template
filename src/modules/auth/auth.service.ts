import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { SignupResponseDto } from './dto/signup.response.dto';
import { SignupRequestDto } from './dto/signup.request.dto';
import { SigninResponseDto } from './dto/signin.response.dto';
import { SigninRequestDto } from './dto/signin.request.dto';
import { User } from '../users/entities/user.entity';
import Redis from 'ioredis';
import { AccessTokenProvider } from './access-token.provider';
import { RefreshTokenProvider } from './refresh-token.provider';
import { hashPassword } from '../../common/utils/password.util';
import { RefreshResponseDto } from './dto/refresh.response.dto';
import { RefreshRequestDto } from './dto/refresh.request.dto';

const REDIS_KEYS = {
  TOKEN_VERSION: (userId: number) => `auth:user:${userId}:token_version`,
  PERMISSIONS: (userId: number) => `auth:user:${userId}:permissions`,
};

const ERROR_MESSAGES = {
  EMAIL_PASSWORD_INVALID: 'Your email or password does not match.',
  REFRESH_TOKEN_INVALID: 'Your refresh token is invalid.',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly accessTokenProvider: AccessTokenProvider,
    private readonly refreshTokenProvider: RefreshTokenProvider,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  /**
   * 회원가입
   */
  async signup(request: SignupRequestDto): Promise<SignupResponseDto> {
    await this.userService.validateIfEmailIsUnique(request.email);

    const encryptedPassword: string = await hashPassword(request.password);

    const savedUser: User = await this.userService.create(
      request.email,
      encryptedPassword,
      request.name,
    );

    await this._initializeUserInRedis(savedUser.id);

    return this._mapToSignupResponse(savedUser);
  }

  /**
   * 사용자 초기화 데이터 Redis에 저장
   */
  private async _initializeUserInRedis(userId: number): Promise<void> {
    await this.redisClient.set(REDIS_KEYS.TOKEN_VERSION(userId), '1');

    await this.redisClient.set(REDIS_KEYS.PERMISSIONS(userId), '');
  }

  /**
   * 회원가입 응답 매핑
   */
  private _mapToSignupResponse(user: User): SignupResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  /**
   * 로그인
   */
  async signin(request: SigninRequestDto): Promise<SigninResponseDto> {
    const user: User = await this.userService.findByEmailAndPassword(
      request.email,
      request.password,
    );

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.EMAIL_PASSWORD_INVALID);
    }

    const accessToken: string = await this.accessTokenProvider.issue(user.id);
    const refreshToken: string = this.refreshTokenProvider.issue(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * 토큰 갱신
   */
  async refresh(request: RefreshRequestDto): Promise<RefreshResponseDto> {
    const userId: number =
      await this.refreshTokenProvider.findUserIdByRefreshToken(
        request.refreshToken,
      );

    if (userId === -1) {
      throw new ForbiddenException(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
    }

    const accessToken: string = await this.accessTokenProvider.issue(userId);
    const refreshToken: string = await this.refreshTokenProvider.renew(
      userId,
      request.refreshToken,
    );

    return { accessToken, refreshToken };
  }

  /**
   * 로그아웃
   */
  async signout(accessToken: string, userId: number): Promise<void> {
    await this.accessTokenProvider.addBlacklist(accessToken);
    await this.refreshTokenProvider.revokeByUserId(userId);
  }
}
