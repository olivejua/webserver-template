import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { convertToSeconds } from '../../common/utils/time.util';

@Injectable()
export class RefreshTokenProvider {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  issue(userId: number): string {
    const refreshToken: string = this._generate();

    this._store(userId, refreshToken);

    return refreshToken;
  }

  private _generate(): string {
    const randomBytes: string = crypto.randomBytes(32).toString('hex');
    const issuedAt: number = Date.now();

    return `${randomBytes}${issuedAt}`;
  }

  private _store(userId: number, refreshToken: string): void {
    const key = this._generateKey(userId, refreshToken);
    const ttl: string = process.env.AUTH_REFRESH_EXPIRES;

    this.redisClient.set(key, 'true', 'EX', convertToSeconds(ttl));
  }

  async findUserIdByRefreshToken(refreshToken: string): Promise<number> {
    const pattern: string = this._pattern(refreshToken);
    const keys: string[] = await this.redisClient.keys(pattern);

    if (keys.length === 0 || keys.length > 1) {
      return -1;
    }

    return Number(keys[0].split(':')[2]);
  }

  async renew(userId: number, refreshToken: string): Promise<string> {
    await this.revoke(refreshToken);

    return this.issue(userId);
  }

  async revoke(refreshToken: string): Promise<void> {
    const userId: number = await this.findUserIdByRefreshToken(refreshToken);
    const key: string = this._generateKey(userId, refreshToken);
    this.redisClient.del(key);
  }

  _generateKey(userId: number, refreshToken: string): string {
    return `auth:user:${userId}:refresh_token:${refreshToken}`;
  }

  _pattern(refreshToken: string): string {
    return `auth:user:*:refresh_token:${refreshToken}`;
  }
}
