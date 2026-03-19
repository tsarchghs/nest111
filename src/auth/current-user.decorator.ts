import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthSessionUser, AuthenticatedRequest } from './access.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthSessionUser | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.auth;
  },
);
