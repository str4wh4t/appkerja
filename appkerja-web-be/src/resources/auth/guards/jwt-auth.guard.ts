import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    // Support both 'req' and 'request' for compatibility
    return ctx.getContext().req || ctx.getContext().request;
  }

  canActivate(context: ExecutionContext) {
    // Cek apakah handler atau class memiliki decorator @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika public, skip authentication
    if (isPublic) {
      return true;
    }

    // File statis lokal (/uploads/*) dilayani @fastify/static tanpa JWT
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest<{ url?: string }>();
      const pathOnly = (req.url ?? '').split('?')[0];
      if (pathOnly === '/uploads' || pathOnly.startsWith('/uploads/')) {
        return true;
      }
    }

    // Jika tidak public, jalankan JWT authentication
    return super.canActivate(context);
  }
}
