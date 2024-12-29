import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import crypto from 'node:crypto';
import process from 'node:process';

@Injectable()
export class RefreshTokenProvider {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  issue(userId: number): string {
    const refreshToken: string = this._generate();

    this._store(userId, refreshToken);

    return refreshToken;
  }

  private _generate(): string {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const issuedAt = Date.now();

    return `${randomBytes}${issuedAt}`;
  }

  private _store(userId: number, refreshToken: string): void {
    const key = `auth:user:${userId}:refresh_token:${refreshToken}`;
    const ttl = process.env.AUTH_REFRESH_EXPIRES;

    this.redisClient.set(key, 'true', 'EX', ttl);
  }

  async validate(userId: number, refreshToken: string): Promise<boolean> {
    const key = `auth:user:${userId}:refresh_token:${refreshToken}`;
    const exists = await this.redisClient.exists(key);

    return exists === 1;
  }
}
