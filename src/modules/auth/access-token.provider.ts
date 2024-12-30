import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { convertToSeconds } from '../../common/utils/time.util';

const REDIS_KEYS = {
  TOKEN_VERSION: (userId: number) => `auth:user:${userId}:token_version`,
  TOKEN_BLACKLIST: (token: string) => `auth:blacklist:${token}`,
};

const ERROR_MESSAGES = {
  TOKEN_REVOKED: 'Your token has been revoked. Please login again.',
  INVALID_TOKEN: 'Invalid token.',
};

@Injectable()
export class AccessTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  /**
   * 액세스 토큰 발급
   */
  async issue(userId: number): Promise<string> {
    const tokenVersion: number = await this._getTokenVersion(userId);
    return this._generate(userId, tokenVersion);
  }

  private _generate(userId: number, tokenVersion: number): string {
    const payload = {
      tokenVersion: tokenVersion,
    };

    return this.jwtService.sign(payload, {
      subject: userId.toString(),
    });
  }

  /**
   * 액세스 토큰 검증
   */
  async verify(token: string): Promise<number> {
    const payload = this._verifyToken(token);
    await this._validateTokenNotBlacklisted(token);
    await this._validateTokenVersion(payload.sub, payload.tokenVersion);

    return payload.sub;
  }

  /**
   * 액세스 토큰 블랙리스트 추가
   */
  addBlacklist(token: string): void {
    const key = REDIS_KEYS.TOKEN_BLACKLIST(token);
    const ttl: number = convertToSeconds(process.env.AUTH_ACCESS_EXPIRES);
    this.redisClient.set(key, 'true', 'EX', ttl);
  }

  /**
   * 토큰 검증
   */
  private _verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.AUTH_JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  /**
   * 토큰이 블랙리스트에 있는지 확인
   */
  private async _validateTokenNotBlacklisted(token: string): Promise<void> {
    const key = REDIS_KEYS.TOKEN_BLACKLIST(token);
    const isBlacklisted = await this.redisClient.exists(key);
    if (isBlacklisted) {
      throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_REVOKED);
    }
  }

  /**
   * 토큰 버전 검증
   */
  private async _validateTokenVersion(
    userId: number,
    tokenVersion: number,
  ): Promise<void> {
    const validTokenVersion = await this._getTokenVersion(userId);
    if (tokenVersion !== validTokenVersion) {
      throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_REVOKED);
    }
  }

  /**
   * 사용자 토큰 버전 조회
   */
  private async _getTokenVersion(userId: number): Promise<number> {
    const tokenVersionKey = REDIS_KEYS.TOKEN_VERSION(userId);
    const tokenVersion = await this.redisClient.get(tokenVersionKey);

    return tokenVersion ? Number(tokenVersion) : 1;
  }
}
