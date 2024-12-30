import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: any): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'A token is required in the Authorization header.',
      );
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.AUTH_JWT_SECRET,
      });

      request.user = {
        id: payload.sub,
        tokenVersion: payload.tokenVersion,
        exp: payload.exp,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authorization: string = request.headers.authorization;
    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
