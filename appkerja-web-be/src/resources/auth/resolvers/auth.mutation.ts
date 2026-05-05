import { Resolver, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../auth.service.js';
import { Public } from '../decorators/public.decorator.js';
import { CurrentUser, Permissions } from '../decorators/index.js';
import {
  AuthLoginInput,
  AuthChangePasswordInput,
  AuthSetActiveRoleInput,
  AuthSetActiveTenantInput,
  LoginResponse,
  AuthRefreshTokenInput,
  RefreshTokenResponse,
  AuthCompleteSsoOnboardingInput,
  AuthRevokeSessionInput,
  AuthRevokeAllSessionsInput,
} from '../dto/index.js';
import { PermissionsGuard } from '../guards/permissions.guard.js';
import { User } from '../../users/entities/user.entity.js';

const AUTH_LOGIN_RATE_LIMIT_MAX = parseInt(
  process.env.AUTH_LOGIN_RATE_LIMIT_MAX || process.env.RATE_LIMIT_MAX || '5',
  10,
);
const AUTH_REFRESH_RATE_LIMIT_MAX = parseInt(
  process.env.AUTH_REFRESH_RATE_LIMIT_MAX || process.env.RATE_LIMIT_MAX || '10',
  10,
);
const AUTH_RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.AUTH_RATE_LIMIT_WINDOW_MS ||
    process.env.RATE_LIMIT_WINDOW_MS ||
    '60000',
  10,
);

@Resolver()
export class AuthMutation {
  constructor(private readonly authService: AuthService) {}

  private extractClientMeta(ctx: any): {
    userAgent?: string | null;
    ipAddress?: string | null;
    deviceName?: string | null;
    deviceType?: string | null;
  } {
    const req = ctx?.req || ctx?.request;
    const headers = req?.headers ?? {};
    const userAgent = String(headers['user-agent'] || '').trim() || null;
    const forwardedFor = String(headers['x-forwarded-for'] || '')
      .split(',')[0]
      ?.trim();
    const ipAddress =
      forwardedFor ||
      String(req?.ip || req?.socket?.remoteAddress || '').trim() ||
      null;
    return {
      userAgent,
      ipAddress,
    };
  }

  @Mutation(() => LoginResponse)
  @Public() // Tandai sebagai public endpoint
  @Throttle({
    default: {
      limit: AUTH_LOGIN_RATE_LIMIT_MAX,
      ttl: AUTH_RATE_LIMIT_WINDOW_MS,
    },
  })
  async authLogin(
    @Args('authLoginInput') authLoginInput: AuthLoginInput,
    @Context() ctx: any,
  ): Promise<LoginResponse> {
    return this.authService.loginWithCredentials(
      authLoginInput.usernameOrEmail,
      authLoginInput.password,
      this.extractClientMeta(ctx),
    );
  }

  @Mutation(() => LoginResponse, {
    name: 'authSetActiveRole',
    description:
      'Menerbitkan token baru dengan claim activeRoleCode untuk konteks UI menu. ' +
      'activeRoleCode harus salah satu user.roles[].code. Permission tetap union semua role.',
  })
  async authSetActiveRole(
    @CurrentUser() currentUser: User,
    @Args('authSetActiveRoleInput')
    authSetActiveRoleInput: AuthSetActiveRoleInput,
  ): Promise<LoginResponse> {
    return this.authService.setActiveRole(
      currentUser as User & {
        impersonatedByUserId?: string;
        jwtSessionId?: string | null;
      },
      authSetActiveRoleInput.activeRoleCode,
    );
  }

  @Mutation(() => LoginResponse, {
    name: 'authSetActiveTenant',
    description:
      'Menerbitkan token baru dengan claim activeTenantId untuk konteks tenancy.',
  })
  async authSetActiveTenant(
    @CurrentUser() currentUser: User,
    @Args('authSetActiveTenantInput')
    authSetActiveTenantInput: AuthSetActiveTenantInput,
  ): Promise<LoginResponse> {
    return this.authService.setActiveTenant(
      currentUser as User & {
        impersonatedByUserId?: string;
        jwtSessionId?: string | null;
      },
      authSetActiveTenantInput.activeTenantId,
    );
  }

  @Mutation(() => Boolean, {
    name: 'authChangePassword',
    description:
      'Change password for the signed-in user. Requires current password. JWT only; no permission code.',
  })
  @Throttle({
    default: {
      limit: 10,
      ttl: AUTH_RATE_LIMIT_WINDOW_MS,
    },
  })
  async authChangePassword(
    @CurrentUser() currentUser: User,
    @Args('authChangePasswordInput')
    authChangePasswordInput: AuthChangePasswordInput,
  ): Promise<boolean> {
    await this.authService.changePassword(
      currentUser,
      authChangePasswordInput.currentPassword,
      authChangePasswordInput.newPassword,
    );
    return true;
  }

  @Mutation(() => LoginResponse, {
    name: 'authCompleteSsoOnboarding',
    description:
      'Selesaikan onboarding SSO (first name wajib, last name opsional, phone, username). ' +
      'Hanya dengan access token purpose google_onboarding. Mengembalikan JWT penuh.',
  })
  async authCompleteSsoOnboarding(
    @CurrentUser() currentUser: User,
    @Args('authCompleteSsoOnboardingInput')
    input: AuthCompleteSsoOnboardingInput,
  ): Promise<LoginResponse> {
    return this.authService.completeSsoOnboarding(
      currentUser as User & {
        jwtPurpose?: string | null;
        jwtSessionId?: string | null;
      },
      input,
    );
  }

  @Mutation(() => RefreshTokenResponse)
  @Public() // Tandai sebagai public endpoint
  @Throttle({
    default: {
      limit: AUTH_REFRESH_RATE_LIMIT_MAX,
      ttl: AUTH_RATE_LIMIT_WINDOW_MS,
    },
  })
  async authRefreshToken(
    @Args('authRefreshTokenInput') authRefreshTokenInput: AuthRefreshTokenInput,
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(authRefreshTokenInput.refresh_token);
  }

  @Mutation(() => LoginResponse, {
    name: 'usersImpersonate',
    description:
      'Membuat token login baru sebagai user target (impersonate). Membutuhkan permission users.impersonate.',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('users.impersonate')
  async usersImpersonate(
    @Args('targetUserId') targetUserId: string,
    @CurrentUser() currentUser: User,
  ): Promise<LoginResponse> {
    return this.authService.impersonate(currentUser, targetUserId);
  }

  @Mutation(() => LoginResponse, {
    name: 'usersExitImpersonate',
    description:
      'Keluar dari mode impersonate dan kembali ke user asli (berdasarkan token impersonate aktif).',
  })
  async usersExitImpersonate(
    @CurrentUser() currentUser: User,
  ): Promise<LoginResponse> {
    return this.authService.exitImpersonation(
      currentUser as User & {
        impersonatedByUserId?: string;
        jwtSessionId?: string | null;
      },
    );
  }

  @Mutation(() => Boolean, {
    name: 'authRevokeSession',
    description: 'Revoke satu session perangkat milik user yang sedang login.',
  })
  async authRevokeSession(
    @CurrentUser() currentUser: User,
    @Args('authRevokeSessionInput') input: AuthRevokeSessionInput,
  ): Promise<boolean> {
    return this.authService.revokeSession(
      currentUser as User & { jwtSessionId?: string | null },
      input.sessionId,
    );
  }

  @Mutation(() => Int, {
    name: 'authRevokeAllSessions',
    description:
      'Revoke semua session perangkat milik user (opsional keep current session).',
  })
  async authRevokeAllSessions(
    @CurrentUser() currentUser: User,
    @Args('authRevokeAllSessionsInput') input: AuthRevokeAllSessionsInput,
  ): Promise<number> {
    return this.authService.revokeAllSessions(
      currentUser as User & { jwtSessionId?: string | null },
      input.keepCurrentSession !== false,
    );
  }
}
