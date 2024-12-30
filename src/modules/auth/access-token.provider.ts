import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { convertToSeconds } from '../../common/utils/time.util';

@Injectable()
export class AccessTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async issue(userId: number): Promise<string> {
    const tokenVersion: number = await this._findTokenVersion(userId);
    return this._generate(userId, tokenVersion);
  }

  private async _findTokenVersion(userId: number): Promise<number> {
    const tokenVersionKey = `auth:user:${userId}:token_version`;
    const tokenVersion = await this.redisClient.get(tokenVersionKey);

    return tokenVersion ? Number(tokenVersion) : 1;
  }

  private _generate(userId: number, tokenVersion: number): string {
    const payload = {
      tokenVersion: tokenVersion,
    };

    return this.jwtService.sign(payload, {
      subject: userId.toString(),
    });
  }

  async verify(token: string): Promise<number> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.AUTH_JWT_SECRET,
      });

      const isBlacklisted: boolean = await this._isBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException(
          'Your token has been revoked. Please login again.',
        );
      }

      const userId: number = payload.sub;
      const validTokenVersion = await this._findTokenVersion(userId);
      if (payload.tokenVersion !== validTokenVersion) {
        throw new UnauthorizedException(
          'Your token has been revoked. Please login again.',
        );
      }

      return payload.sub;
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }

  addBlacklist(token: string): void {
    const key: string = `auth:blacklist:${token}`;
    const ttl: number = convertToSeconds(process.env.AUTH_ACCESS_EXPIRES);
    this.redisClient.set(key, 'true', 'EX', ttl);
  }

  private async _isBlacklisted(accessToken: string): Promise<boolean> {
    const key = `auth:blacklist:${accessToken}`;
    const exist: number = await this.redisClient.exists(key);
    return exist === 1;
  }
}
