import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { User } from '../../users/entities/user.entity.js';
import { SUPERADMIN_ROLE_CODE } from '../../roles/entities/role.entity.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
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

    if (!user.activeTenantId) {
      throw new ForbiddenException(
        'Tenant context is required. Please select active tenant first.',
      );
    }

    if (user.roles?.some((r) => r.code === SUPERADMIN_ROLE_CODE)) {
      return true;
    }

    // Collect all permissions from user's roles
    const userPermissions = new Set<string>();
    if (user.roles) {
      for (const role of user.roles) {
        if (role.permissions) {
          for (const permission of role.permissions) {
            userPermissions.add(permission.code);
          }
        }
      }
    }

    // Check if user has any of the required permissions (OR logic)
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.has(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
