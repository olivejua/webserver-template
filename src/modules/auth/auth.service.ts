import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly accessTokenProvider: AccessTokenProvider,
    private readonly refreshTokenProvider: RefreshTokenProvider,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async signup(request: SignupRequestDto): Promise<SignupResponseDto> {
    await this.userService.validateIfEmailIsUnique(request.email);

    const encryptedPassword: string = await hashPassword(request.password);

    const savedUser: User = await this.userService.create(
      request.email,
      encryptedPassword,
      request.name,
    );

    this._storeUserInitialization(savedUser.id);

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      createdAt: savedUser.createdAt,
    };
  }

  private _storeUserInitialization(userId: number): void {
    const initTokenVersion: number = 1;
    const tokenVersionKey = `auth:user:${userId}:token_version`;
    this.redisClient.set(tokenVersionKey, initTokenVersion.toString());

    const permissions: string[] = [];
    const permissionsKey = `auth:user:${userId}:permissions`;
    this.redisClient.set(permissionsKey, permissions.join(','));
  }

  async signin(request: SigninRequestDto): Promise<SigninResponseDto> {
    const user: User = await this.userService.findByEmailAndPassword(
      request.email,
      request.password,
    );

    if (!user) {
      throw new UnauthorizedException('Your email or password does not match.');
    }

    const accessToken: string = await this.accessTokenProvider.issue(user.id);
    const refreshToken: string = this.refreshTokenProvider.issue(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    const userId: number =
      await this.refreshTokenProvider.findUserIdByRefreshToken(refreshToken);

    if (userId === -1) {
      throw new ForbiddenException('Your refresh token is invalid.');
    }

    const accessToken: string = await this.accessTokenProvider.issue(userId);
    const newRefreshToken: string = await this.refreshTokenProvider.renew(
      userId,
      refreshToken,
    );

    return {
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    };
  }

  signout(accessToken: string, refreshToken: string): void {
    //access token 블랙리스트에 올림, user id의 refresh 토큰 제거
    //auth:blacklist:{} -> 만료기한은 토큰 만료기한
    this._addBlacklist(accessToken);
    this.refreshTokenProvider.revoke(refreshToken);
  }

  _addBlacklist(accessToken: string): void {
    const key = `auth:blacklist:${accessToken}`;
    this.redisClient.set(key, 'true', 'EX', accessToken);
  }
}
