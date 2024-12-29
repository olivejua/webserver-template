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
    const key = `auth:user:${userId}:refresh_token:${refreshToken}`;
    const ttl: string = process.env.AUTH_REFRESH_EXPIRES;

    this.redisClient.set(key, 'true', 'EX', convertToSeconds(ttl));
  }

  async validate(userId: number, refreshToken: string): Promise<boolean> {
    const key = `auth:user:${userId}:refresh_token:${refreshToken}`;
    const exists = await this.redisClient.exists(key);

    return exists === 1;
  }
}
