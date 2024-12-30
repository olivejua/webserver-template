import { Request } from 'express';

export const extractTokenFromAuthorizationHeader = (
  request: Request,
): string | null => {
  const authorization: string = request.headers.authorization;
  if (!authorization) {
    return null;
  }

  const [type, token] = authorization.split(' ');
  return type === 'Bearer' ? token : null;
};

export const removeBearerFromAuthorizationHeader = (
  bearerToken: string,
): string | null => {
  const [type, token] = bearerToken.split(' ');
  return type === 'Bearer' ? token : null;
};
