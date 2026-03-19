import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AppArea, AuthenticatedRequest } from './access.types';
import { ALLOWED_AREAS_KEY } from './areas.decorator';

@Injectable()
export class AreaGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredAreas =
      this.reflector.getAllAndOverride<AppArea[]>(ALLOWED_AREAS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredAreas.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = request.auth;

    if (!auth) {
      throw new ForbiddenException('Authentication context is missing');
    }

    if (!requiredAreas.some((area) => auth.allowedAreas.includes(area))) {
      throw new ForbiddenException('You do not have access to this area');
    }

    return true;
  }
}
