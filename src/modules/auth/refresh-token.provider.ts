import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { convertToSeconds } from '../../common/utils/time.util';

@Injectable()
export class RefreshTokenProvider {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  private readonly WHILE_CARD: string = '*';

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
    const key = this._generateKeyOrPattern(userId.toString(), refreshToken);
    const ttl: string = process.env.AUTH_REFRESH_EXPIRES;

    this.redisClient.set(key, 'true', 'EX', convertToSeconds(ttl));
  }

  async findUserIdByRefreshToken(refreshToken: string): Promise<number> {
    const pattern: string = this._generateKeyOrPattern(
      this.WHILE_CARD,
      refreshToken,
    );
    const keys: string[] = await this.redisClient.keys(pattern);

    if (keys.length === 0 || keys.length > 1) {
      return -1;
    }

    return Number(keys[0].split(':')[2]);
  }

  async renew(userId: number, refreshToken: string): Promise<string> {
    await this._revokeByRefreshToken(refreshToken);

    return this.issue(userId);
  }

  private async _revokeByRefreshToken(refreshToken: string): Promise<void> {
    const userId: number = await this.findUserIdByRefreshToken(refreshToken);
    const key: string = this._generateKeyOrPattern(
      userId.toString(),
      refreshToken,
    );
    this.redisClient.del(key);
  }

  async revokeByUserId(userId: number): Promise<void> {
    const pattern: string = this._generateKeyOrPattern(
      userId.toString(),
      this.WHILE_CARD,
    );

    const keys = await this.redisClient.keys(pattern);
    this.redisClient.del(keys);
  }

  private _generateKeyOrPattern(userId: string, refreshToken: string): string {
    return `auth:user:${userId}:refresh_token:${refreshToken}`;
  }
}
