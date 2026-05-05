import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { Role, SUPERADMIN_ROLE_CODE } from '../roles/entities/role.entity.js';
import * as bcrypt from 'bcrypt';
import { GoogleOauthService } from './services/index.js';
import { Tenant } from '../tenants/entities/tenant.entity.js';
import { UserTenant } from '../tenants/entities/user-tenant.entity.js';
import { RedisService } from '../../redis/redis.service.js';

type GoogleOauthStatePayload = {
  type: 'google_oauth_state';
  tenantId: string;
  nonce: string;
};

type GoogleCallbackResult = {
  user: User;
  tenantId: string;
};

type LoginExchangePayload = {
  userId: string;
  tenantId: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private googleOauthService: GoogleOauthService,
    private readonly redisService: RedisService,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(UserTenant)
    private readonly userTenantRepository: Repository<UserTenant>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  private readonly loginCodeMemoryStore = new Map<
    string,
    { expiresAt: number; payload: LoginExchangePayload }
  >();

  private canContinueGoogleOnboarding(user: User): boolean {
    return Boolean(user.googleId?.trim()) && user.completedAt == null;
  }

  /** Normalisasi input role aktif (UI); null = tidak disematkan di JWT. */
  private normalizeActiveRoleCodeInput(raw?: string | null): string | null {
    if (raw == null) {
      return null;
    }
    const t = String(raw).trim();
    return t.length > 0 ? t : null;
  }

  private normalizeActiveTenantIdInput(raw?: string | null): string | null {
    if (raw == null) {
      return null;
    }
    const t = String(raw).trim();
    return t.length > 0 ? t : null;
  }

  private getDefaultTenantCode(): string {
    return (
      this.configService.get<string>('app.defaultTenantCode') ||
      process.env.DEFAULT_TENANT_CODE ||
      'default'
    );
  }

  private getGoogleStateSecret(): string {
    return (
      this.configService.get<string>('app.google.stateSecret') ||
      this.configService.get<string>('app.jwt.secret') ||
      'google-state-secret'
    );
  }

  private getGoogleLoginCodeExpiresInMs(): number {
    const value = this.configService.get<number>(
      'app.google.loginCodeExpiresInMs',
    );
    return Number.isFinite(value) && value! > 0 ? Number(value) : 60_000;
  }

  private async resolveTenantForGoogleFlow(
    tenantCodeRaw?: string,
  ): Promise<Tenant> {
    const requested = String(tenantCodeRaw || '').trim();
    const defaultCode = this.getDefaultTenantCode();
    const requestedCode = requested.length > 0 ? requested : defaultCode;

    const requestedTenant = await this.tenantRepository.findOne({
      where: { code: requestedCode, deletedAt: IsNull() },
    });
    if (requestedTenant) {
      return requestedTenant;
    }

    const fallbackTenant = await this.tenantRepository.findOne({
      where: { code: defaultCode, deletedAt: IsNull() },
    });
    if (fallbackTenant) {
      return fallbackTenant;
    }

    throw new BadRequestException(
      `Tenant "${defaultCode}" tidak ditemukan. Jalankan seeder tenant terlebih dahulu.`,
    );
  }

  buildGoogleAuthState(tenantId: string): string {
    const stateExpiresIn =
      this.configService.get<string>('app.google.stateExpiresIn') || '10m';
    return this.jwtService.sign(
      {
        type: 'google_oauth_state',
        tenantId,
        nonce: randomUUID(),
      } satisfies GoogleOauthStatePayload,
      {
        secret: this.getGoogleStateSecret(),
        expiresIn: stateExpiresIn as any,
      },
    );
  }

  private verifyGoogleAuthState(state: string): GoogleOauthStatePayload {
    try {
      const payload = this.jwtService.verify(state, {
        secret: this.getGoogleStateSecret(),
      });
      if (payload.type !== 'google_oauth_state' || !payload.tenantId) {
        throw new BadRequestException('State OAuth tidak valid.');
      }
      return payload;
    } catch {
      throw new BadRequestException(
        'State OAuth tidak valid atau kedaluwarsa.',
      );
    }
  }

  private async ensureUserTenantMembership(
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const membership = await this.userTenantRepository.findOne({
      where: { userId, tenantId },
    });
    if (membership) {
      return;
    }
    await this.userTenantRepository.save(
      this.userTenantRepository.create({ userId, tenantId }),
    );
  }

  private async ensureGuestRoleAssignment(
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const guestRole = await this.roleRepository.findOne({
      where: { code: 'guest' },
    });
    if (!guestRole) {
      throw new BadRequestException(
        'Role "guest" belum tersedia. Jalankan roles seeder terlebih dahulu.',
      );
    }

    await this.roleRepository.manager.query(
      `
      INSERT INTO user_roles (userId, roleId, tenantId)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE tenantId = VALUES(tenantId)
      `,
      [userId, guestRole.id, tenantId],
    );
    await this.usersService.invalidateUserCache(userId);
  }

  private async storeOneTimeLoginCode(
    payload: LoginExchangePayload,
  ): Promise<string> {
    const code = randomUUID();
    const ttlMs = this.getGoogleLoginCodeExpiresInMs();
    const key = `auth:google:code:${code}`;
    if (this.redisService.isAvailable()) {
      await this.redisService.set(key, payload, ttlMs);
      return code;
    }

    this.loginCodeMemoryStore.set(code, {
      payload,
      expiresAt: Date.now() + ttlMs,
    });
    return code;
  }

  private async consumeOneTimeLoginCode(
    code: string,
  ): Promise<LoginExchangePayload> {
    const normalized = String(code || '').trim();
    if (!normalized) {
      throw new BadRequestException('Code wajib diisi.');
    }

    const key = `auth:google:code:${normalized}`;
    if (this.redisService.isAvailable()) {
      const payload = await this.redisService.getDel<LoginExchangePayload>(key);
      if (!payload) {
        throw new BadRequestException(
          'Code tidak valid atau sudah kedaluwarsa.',
        );
      }
      return payload;
    }

    const found = this.loginCodeMemoryStore.get(normalized);
    this.loginCodeMemoryStore.delete(normalized);
    if (!found || found.expiresAt <= Date.now()) {
      throw new BadRequestException('Code tidak valid atau sudah kedaluwarsa.');
    }
    return found.payload;
  }

  private async resolveDefaultActiveTenantId(
    user: User,
  ): Promise<string | null> {
    if (this.usersService.hasRole(user, SUPERADMIN_ROLE_CODE)) {
      const firstTenant = await this.tenantRepository.findOne({
        where: { deletedAt: IsNull() },
        order: { createdAt: 'ASC' },
      });
      return firstTenant?.id ?? null;
    }

    const membership = await this.userTenantRepository.findOne({
      where: { userId: user.id },
      order: { createdAt: 'ASC' },
    });
    return membership?.tenantId ?? null;
  }

  private async assertActiveTenantBelongsToUser(
    user: User,
    activeTenantIdRaw?: string | null,
  ): Promise<string | null> {
    const normalized = this.normalizeActiveTenantIdInput(activeTenantIdRaw);
    const targetTenantId =
      normalized ?? (await this.resolveDefaultActiveTenantId(user));
    if (!targetTenantId) {
      return null;
    }

    if (this.usersService.hasRole(user, SUPERADMIN_ROLE_CODE)) {
      const tenant = await this.tenantRepository.findOne({
        where: { id: targetTenantId, deletedAt: IsNull() },
      });
      if (!tenant) {
        throw new BadRequestException('activeTenantId tidak valid');
      }
      return targetTenantId;
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: targetTenantId, deletedAt: IsNull() },
    });
    if (!tenant) {
      throw new BadRequestException('activeTenantId tidak valid');
    }

    const membership = await this.userTenantRepository.findOne({
      where: { userId: user.id, tenantId: targetTenantId },
    });
    if (!membership) {
      throw new BadRequestException(
        `activeTenantId "${targetTenantId}" bukan tenant yang dimiliki user`,
      );
    }
    return targetTenantId;
  }

  async findAccessibleTenants(user: User): Promise<Tenant[]> {
    if (this.usersService.hasRole(user, SUPERADMIN_ROLE_CODE)) {
      return this.tenantRepository.find({
        where: { deletedAt: IsNull() },
        order: { name: 'ASC' },
      });
    }
    const memberships = await this.userTenantRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'ASC' },
    });
    if (memberships.length === 0) {
      return [];
    }
    const tenantIds = [...new Set(memberships.map((m) => m.tenantId))];
    return this.tenantRepository.find({
      where: { id: In(tenantIds), deletedAt: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async findActiveTenant(user: User): Promise<Tenant | null> {
    const activeTenantId = this.normalizeActiveTenantIdInput(
      user.activeTenantId,
    );
    if (!activeTenantId) {
      return null;
    }
    return this.tenantRepository.findOne({
      where: { id: activeTenantId, deletedAt: IsNull() },
    });
  }

  /**
   * Pastikan activeRoleCode (jika non-null) ada di user.roles[].code.
   * Tidak mempengaruhi permission (tetap union di PermissionsGuard).
   */
  private assertActiveRoleBelongsToUser(
    user: User,
    activeRoleCode: string | null,
  ): string | null {
    if (activeRoleCode === null) {
      return null;
    }
    const codes = (user.roles ?? []).map((r) => r.code);
    if (!codes.includes(activeRoleCode)) {
      throw new BadRequestException(
        `activeRoleCode "${activeRoleCode}" bukan role yang dimiliki user`,
      );
    }
    return activeRoleCode;
  }

  async generateAccessToken(
    user: User,
    options?: {
      impersonatedByUserId?: string | null;
      activeRoleCode?: string | null;
      activeTenantId?: string | null;
      /** Token terbatas: hanya endpoint onboarding Google. */
      purpose?: string | null;
    },
  ): Promise<string> {
    const jwtConfig = this.configService.get<any>('app.jwt');

    const payload: Record<string, unknown> = {
      sub: user.id,
      email: user.email,
      googleId: user.googleId,
      type: 'access',
    };
    if (options?.impersonatedByUserId) {
      payload.impersonatedByUserId = options.impersonatedByUserId;
    }
    if (options?.activeRoleCode != null && options.activeRoleCode.length > 0) {
      payload.activeRoleCode = options.activeRoleCode;
    }
    if (options?.activeTenantId != null && options.activeTenantId.length > 0) {
      payload.activeTenantId = options.activeTenantId;
    }
    if (options?.purpose != null && String(options.purpose).length > 0) {
      payload.purpose = String(options.purpose);
    }

    return this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.expiresIn,
    });
  }

  async generateRefreshToken(
    user: User,
    options?: {
      impersonatedByUserId?: string | null;
      activeRoleCode?: string | null;
      activeTenantId?: string | null;
      purpose?: string | null;
    },
  ): Promise<string> {
    const jwtConfig = this.configService.get<any>('app.jwt');

    const payload: Record<string, unknown> = {
      sub: user.id,
      type: 'refresh',
    };
    if (options?.impersonatedByUserId) {
      payload.impersonatedByUserId = options.impersonatedByUserId;
    }
    if (options?.activeRoleCode != null && options.activeRoleCode.length > 0) {
      payload.activeRoleCode = options.activeRoleCode;
    }
    if (options?.activeTenantId != null && options.activeTenantId.length > 0) {
      payload.activeTenantId = options.activeTenantId;
    }
    if (options?.purpose != null && String(options.purpose).length > 0) {
      payload.purpose = String(options.purpose);
    }

    return this.jwtService.sign(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    });
  }

  // Backward compatibility
  async generateJwtToken(user: User): Promise<string> {
    return this.generateAccessToken(user);
  }

  async login(
    user: User,
    options?: {
      impersonatedByUserId?: string | null;
      activeRoleCode?: string | null;
      activeTenantId?: string | null;
      purpose?: string | null;
    },
  ) {
    const normalized = this.normalizeActiveRoleCodeInput(
      options?.activeRoleCode,
    );
    const activeRoleCode = this.assertActiveRoleBelongsToUser(user, normalized);
    const activeTenantId = await this.assertActiveTenantBelongsToUser(
      user,
      options?.activeTenantId,
    );

    const purpose =
      options?.purpose != null && String(options.purpose).trim().length > 0
        ? String(options.purpose).trim()
        : null;

    const accessToken = await this.generateAccessToken(user, {
      impersonatedByUserId: options?.impersonatedByUserId,
      activeRoleCode,
      activeTenantId,
      purpose,
    });
    const refreshToken = await this.generateRefreshToken(user, {
      impersonatedByUserId: options?.impersonatedByUserId,
      activeRoleCode,
      activeTenantId,
      purpose,
    });
    const jwtConfig = this.configService.get<any>('app.jwt');

    // Get full user with relations
    const fullUser = await this.usersService.findOne(user.id);
    if (!fullUser) {
      throw new Error('User not found');
    }

    Object.assign(fullUser, { activeRoleCode, activeTenantId });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: jwtConfig.expiresIn,
      user: fullUser,
      activeRoleCode,
      activeTenantId,
    };
  }

  async getGoogleAuthorizationUrl(tenantCodeRaw?: string): Promise<string> {
    const tenant = await this.resolveTenantForGoogleFlow(tenantCodeRaw);
    const state = this.buildGoogleAuthState(tenant.id);
    return this.googleOauthService.getAuthUrl(state);
  }

  /**
   * Handle Google callback dengan authorization code + state tenant context.
   */
  async handleGoogleCallback(
    code: string,
    state?: string,
  ): Promise<GoogleCallbackResult> {
    if (!state) {
      throw new BadRequestException('State OAuth wajib diisi.');
    }
    const statePayload = this.verifyGoogleAuthState(state);

    const tenant = await this.tenantRepository.findOne({
      where: { id: statePayload.tenantId, deletedAt: IsNull() },
    });
    if (!tenant) {
      throw new BadRequestException('Tenant pada state OAuth tidak valid.');
    }

    const token = await this.googleOauthService.exchangeCodeForToken(code);
    const userInfo = await this.googleOauthService.getUserInfo(
      token.access_token,
    );
    if (userInfo.email_verified !== true) {
      throw new UnauthorizedException('Email Google belum terverifikasi.');
    }

    const user = await this.usersService.syncFromGoogle({
      googleId: userInfo.sub,
      email: userInfo.email.toLowerCase(),
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      isEmailVerified: userInfo.email_verified,
      picture: userInfo.picture,
    });

    const needsGoogleOnboarding = this.canContinueGoogleOnboarding(user);
    if (
      user.status?.code !== 'active' &&
      !(user.status?.code === 'inactive' && needsGoogleOnboarding)
    ) {
      throw new UnauthorizedException('User account is not active');
    }

    await this.ensureUserTenantMembership(user.id, tenant.id);
    await this.ensureGuestRoleAssignment(user.id, tenant.id);

    return {
      user,
      tenantId: tenant.id,
    };
  }

  async createGoogleLoginExchangeCode(
    user: User,
    tenantId: string,
  ): Promise<string> {
    return this.storeOneTimeLoginCode({
      userId: user.id,
      tenantId,
    });
  }

  async exchangeGoogleLoginCode(code: string) {
    const payload = await this.consumeOneTimeLoginCode(code);
    const user = await this.usersService.findOne(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan.');
    }
    const needsGoogleOnboarding = this.canContinueGoogleOnboarding(user);
    if (
      user.status?.code !== 'active' &&
      !(user.status?.code === 'inactive' && needsGoogleOnboarding)
    ) {
      throw new UnauthorizedException('User account is not active');
    }
    if (needsGoogleOnboarding) {
      return {
        ...(await this.login(user, {
          activeTenantId: payload.tenantId,
          purpose: 'google_onboarding',
        })),
        token_purpose: 'google_onboarding' as const,
      };
    }
    return {
      ...(await this.login(user, { activeTenantId: payload.tenantId })),
      token_purpose: null as string | null,
    };
  }

  /**
   * Selesaikan onboarding SSO (nama, phone, username), lalu terbitkan JWT penuh.
   */
  async completeSsoOnboarding(
    currentUser: User & { jwtPurpose?: string | null },
    input: {
      firstName: string;
      lastName?: string | null;
      username: string;
      phone: string;
    },
  ) {
    if (currentUser.jwtPurpose !== 'google_onboarding') {
      throw new ForbiddenException(
        'Token tidak valid untuk menyelesaikan onboarding SSO.',
      );
    }
    await this.usersService.completeSsoOnboarding(currentUser.id, input);
    const user = await this.usersService.findOne(currentUser.id);
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan.');
    }
    return this.login(user, {
      activeTenantId: currentUser.activeTenantId ?? undefined,
    });
  }

  /**
   * Validate user dengan username/email dan password
   */
  async validateUser(usernameOrEmail: string, password: string): Promise<User> {
    // Find user by username or email
    const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status?.code !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    // Update last login time
    await this.usersService.update(user.id, {
      lastLoginAt: new Date(),
    });

    const updatedUser = await this.usersService.findOne(user.id);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }

    return updatedUser;
  }

  /**
   * Login dengan username/email dan password
   */
  async loginWithCredentials(usernameOrEmail: string, password: string) {
    const user = await this.validateUser(usernameOrEmail, password);
    return this.login(user);
  }

  /**
   * Ganti password untuk user yang sedang login (verifikasi password lama).
   */
  async changePassword(
    currentUser: User,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.usersService.changeOwnPassword(
      currentUser.id,
      currentPassword,
      newPassword,
    );
  }

  /**
   * Ganti role aktif untuk konteks UI; menerbitkan access + refresh token baru
   * dengan claim activeRoleCode (permission tetap union semua role).
   */
  async setActiveRole(
    currentUser: User & { impersonatedByUserId?: string },
    activeRoleCodeRaw: string,
  ) {
    const fullUser = await this.usersService.findOne(currentUser.id);
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    const normalized = this.normalizeActiveRoleCodeInput(activeRoleCodeRaw);
    if (normalized === null) {
      throw new BadRequestException('activeRoleCode wajib diisi');
    }
    const activeRoleCode = this.assertActiveRoleBelongsToUser(
      fullUser,
      normalized,
    );
    return this.login(fullUser, {
      impersonatedByUserId: currentUser.impersonatedByUserId ?? null,
      activeRoleCode,
      activeTenantId: currentUser.activeTenantId ?? null,
    });
  }

  async setActiveTenant(
    currentUser: User & { impersonatedByUserId?: string },
    activeTenantIdRaw: string,
  ) {
    const fullUser = await this.usersService.findOne(currentUser.id);
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    const activeTenantId = await this.assertActiveTenantBelongsToUser(
      fullUser,
      activeTenantIdRaw,
    );
    if (!activeTenantId) {
      throw new BadRequestException('activeTenantId wajib diisi');
    }
    return this.login(fullUser, {
      impersonatedByUserId: currentUser.impersonatedByUserId ?? null,
      activeRoleCode: currentUser.activeRoleCode ?? null,
      activeTenantId,
    });
  }

  /**
   * Refresh access token menggunakan refresh token
   */
  async refreshToken(refreshToken: string) {
    const jwtConfig = this.configService.get<any>('app.jwt');

    try {
      // Verify refresh token dengan refreshSecret
      const payload = this.jwtService.verify(refreshToken, {
        secret: jwtConfig.refreshSecret,
      });

      // Validate token type
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Get user from database
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const needsGoogleOnboarding = this.canContinueGoogleOnboarding(user);
      const isGoogleOnboardingToken = payload.purpose === 'google_onboarding';

      // Check if user is active (allow inactive only for onboarding token flow)
      if (
        user.status?.code !== 'active' &&
        !(isGoogleOnboardingToken && user.status?.code === 'inactive' && needsGoogleOnboarding)
      ) {
        throw new UnauthorizedException('User account is not active');
      }

      const preservedActive = this.normalizeActiveRoleCodeInput(
        payload.activeRoleCode as string | undefined,
      );
      const activeRoleCode = this.assertActiveRoleBelongsToUser(
        user,
        preservedActive,
      );
      const activeTenantId = await this.assertActiveTenantBelongsToUser(
        user,
        (payload.activeTenantId as string | undefined) ?? null,
      );

      const purposeRaw = payload.purpose;
      const purpose =
        typeof purposeRaw === 'string' && purposeRaw.trim().length > 0
          ? purposeRaw.trim()
          : null;

      // Generate new access token
      const newAccessToken = await this.generateAccessToken(user, {
        impersonatedByUserId: payload.impersonatedByUserId ?? null,
        activeRoleCode,
        activeTenantId,
        purpose,
      });

      // Generate new refresh token (token rotation untuk security)
      const newRefreshToken = await this.generateRefreshToken(user, {
        impersonatedByUserId: payload.impersonatedByUserId ?? null,
        activeRoleCode,
        activeTenantId,
        purpose,
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: 'Bearer',
        expires_in: jwtConfig.expiresIn,
        activeRoleCode,
        activeTenantId,
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw error;
    }
  }

  async impersonate(currentUser: User, targetUserId: string) {
    if (currentUser.id === targetUserId) {
      throw new BadRequestException(
        'Tidak dapat melakukan impersonate ke user sendiri',
      );
    }

    const targetUser = await this.usersService.findOne(targetUserId);
    if (!targetUser) {
      throw new UnauthorizedException('Target user tidak ditemukan');
    }

    if (targetUser.status?.code !== 'active') {
      throw new UnauthorizedException('Target user tidak aktif');
    }

    if (this.usersService.hasRole(targetUser, SUPERADMIN_ROLE_CODE)) {
      throw new ForbiddenException(
        'Tidak dapat melakukan impersonate ke akun superadmin',
      );
    }

    return this.login(targetUser, {
      impersonatedByUserId: currentUser.id,
      activeTenantId: currentUser.activeTenantId ?? null,
    });
  }

  async exitImpersonation(
    currentUser: User & { impersonatedByUserId?: string },
  ) {
    const originalUserId = currentUser.impersonatedByUserId;
    if (!originalUserId) {
      throw new BadRequestException('Saat ini tidak dalam mode impersonate');
    }

    const originalUser = await this.usersService.findOne(originalUserId);
    if (!originalUser) {
      throw new UnauthorizedException('User asli tidak ditemukan');
    }

    if (originalUser.status?.code !== 'active') {
      throw new UnauthorizedException('User asli tidak aktif');
    }

    // Pertahankan tenant konteks dari JWT impersonate (sama seperti saat impersonate dimulai).
    // Tanpa ini, login() memakai tenant default user asli sehingga operator kehilangan tenant B.
    return this.login(originalUser, {
      activeTenantId: currentUser.activeTenantId ?? null,
    });
  }
}
