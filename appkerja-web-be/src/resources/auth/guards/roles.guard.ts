import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { User } from '../../users/entities/user.entity.js';
import { SUPERADMIN_ROLE_CODE } from '../../roles/entities/role.entity.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from context
    const ctx = GqlExecutionContext.create(context);
    const graphqlContext = ctx.getContext();
    const request = graphqlContext.req || graphqlContext.request;
    const user: User = request?.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Selaras dengan PermissionsGuard: superadmin melewati pengecekan role (lihat docs/MODULE-STRUCTURE-PATTERN.md).
    if (user.roles?.some((r) => r.code === SUPERADMIN_ROLE_CODE)) {
      return true;
    }

    // Check if user has any of the required roles
    const userRoles = user.roles?.map((role) => role.code) || [];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
