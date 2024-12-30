import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

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
      subject: userId.toString(),
    });
  }

  async verify(token: string): Promise<JwtPayloadDto> {
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

      return {
        sub: payload.sub,
        tokenVersion: payload.tokenVersion,
        exp: payload.exp,
        iat: payload.iat,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }

  addBlacklist(token: string): void {
    const key = `auth:blacklist:${token}`;
    this.redisClient.set(key, 'true', 'EX', token);
  }

  private async _isBlacklisted(accessToken: string): Promise<boolean> {
    const key = `auth:blacklist:${accessToken}`;
    const exist: number = await this.redisClient.exists(key);
    return exist === 1;
  }
}
