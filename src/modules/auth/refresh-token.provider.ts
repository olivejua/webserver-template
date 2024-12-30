import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { convertToSeconds } from '../../common/utils/time.util';

const REDIS_KEYS = {
  REFRESH_TOKEN: (userId: string, token: string) =>
    `auth:user:${userId}:refresh_token:${token}`,
  USER_REFRESH_PATTERN: (userId: string) =>
    `auth:user:${userId}:refresh_token:*`,
  ANY_USER_REFRESH_PATTERN: (token: string) =>
    `auth:user:*:refresh_token:${token}`,
};

const ERROR_MESSAGES = {
  INVALID_REFRESH_TOKEN: 'Invalid refresh token.',
};

@Injectable()
export class RefreshTokenProvider {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  /**
   * 리프레시 토큰 발급
   */
  issue(userId: number): string {
    const refreshToken: string = this._generate();
    this._store(userId, refreshToken);
    return refreshToken;
  }

  /**
   * 리프레시 토큰으로 사용자 ID 조회
   */
  async findUserIdByRefreshToken(refreshToken: string): Promise<number> {
    const pattern = REDIS_KEYS.ANY_USER_REFRESH_PATTERN(refreshToken);
    const keys = await this.redisClient.keys(pattern);

    if (keys.length !== 1) {
      return -1;
    }

    return Number(keys[0].split(':')[2]);
  }

  /**
   * 리프레시 토큰 갱신
   */
  async renew(userId: number, refreshToken: string): Promise<string> {
    await this._revokeByRefreshToken(refreshToken);
    return this.issue(userId);
  }

  /**
   * 특정 사용자 ID의 모든 리프레시 토큰 제거
   */
  async revokeByUserId(userId: number): Promise<void> {
    const pattern = REDIS_KEYS.USER_REFRESH_PATTERN(userId.toString());

    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
  }

  /**
   * 리프레시 토큰 생성
   */
  private _generate(): string {
    const randomBytes: string = crypto.randomBytes(32).toString('hex');
    const issuedAt: number = Date.now();

    return `${randomBytes}${issuedAt}`;
  }

  /**
   * 리프레시 토큰 저장
   */
  private async _store(userId: number, refreshToken: string): Promise<void> {
    const key = REDIS_KEYS.REFRESH_TOKEN(userId.toString(), refreshToken);
    const ttl: string = process.env.AUTH_REFRESH_EXPIRES;

    await this.redisClient.set(key, 'true', 'EX', convertToSeconds(ttl));
  }

  /**
   * 리프레시 토큰 제거
   */
  private async _revokeByRefreshToken(refreshToken: string): Promise<void> {
    const userId = await this.findUserIdByRefreshToken(refreshToken);
    if (userId === -1) {
      throw new Error(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const key = REDIS_KEYS.REFRESH_TOKEN(userId.toString(), refreshToken);
    await this.redisClient.del(key);
  }
}
