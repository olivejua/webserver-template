import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import process from 'node:process';

@Injectable()
export class AccessTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async issue(userId: number): Promise<string> {
    const tokenVersionKey = `auth:user:${userId}:token_version`;
    const tokenVersion: string = await this.redisClient.get(tokenVersionKey);

    return this._generate(userId, Number(tokenVersion));
  }

  private _generate(userId: number, tokenVersion: number): string {
    const payload = {
      tokenVersion: tokenVersion,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.AUTH_JWT_SECRET,
      algorithm: 'HS256',
      issuer: process.env.AUTH_JWT_ISSUER,
      keyid: '1',
      expiresIn: process.env.AUTH_ACCESS_EXPIRES,
      subject: userId.toString(),
    });
  }
}
