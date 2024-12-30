import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AccessTokenProvider } from '../../modules/auth/access-token.provider';
import { extractTokenFromAuthorizationHeader } from '../utils/http-header.util';

@Injectable()
export class AuthJwtGuard implements CanActivate {
  constructor(
    private readonly accessTokenProvider: AccessTokenProvider,
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
    const token = extractTokenFromAuthorizationHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'A token is required in the Authorization header.',
      );
    }

    const userId: number = await this.accessTokenProvider.verify(token);
    request.user = {
      id: userId,
    };

    return true;
  }
}
