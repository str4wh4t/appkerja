import { Resolver, Mutation, Args } from '@nestjs/graphql';
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
  ): Promise<LoginResponse> {
    return this.authService.loginWithCredentials(
      authLoginInput.usernameOrEmail,
      authLoginInput.password,
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
      currentUser as User & { impersonatedByUserId?: string },
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
      currentUser as User & { impersonatedByUserId?: string },
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
      currentUser as User & { jwtPurpose?: string | null },
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
      currentUser as User & { impersonatedByUserId?: string },
    );
  }
}
