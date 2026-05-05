import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In, Like, SelectQueryBuilder } from 'typeorm';
import { assertNoForeignKeyViolation } from '../../common/assert-no-foreign-key-violation.js';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from './entities/index.js';
import { Role, SUPERADMIN_ROLE_CODE } from '../roles/entities/role.entity.js';
import { RedisService } from '../../redis/redis.service.js';
import { UploadService } from '../../storage/upload.service.js';
import { FileUpload } from 'graphql-upload-ts';
import { Tenant } from '../tenants/entities/tenant.entity.js';
import { UserTenant } from '../tenants/entities/user-tenant.entity.js';

/**
 * Relasi untuk JWT validate + cache Redis.
 *
 * - `user_role_scopes` selalu anak dari baris `user_roles` (UserRole), **bukan** FK langsung ke `users` atau `roles`.
 * - Rantai load: `userRoles` → `userRoles.userRoleScopes` (+ `userRoles.role` untuk konteks role per baris).
 * - `roles` / `roles.permissions` = hak akses lewat relasi role–permission (terpisah dari baris scope per `user_roles`).
 * - Jangan tambahkan `userRoles.user` (sirkular ke User).
 */
/** URL foto Google userinfo — hanya HTTPS, disimpan apa adanya di `avatarUrl`. */
function googleProfilePictureUrl(raw?: string | null): string | undefined {
  const s = raw?.trim();
  if (!s || !/^https:\/\//i.test(s)) {
    return undefined;
  }
  return s;
}

export const USER_AUTH_LOAD_RELATIONS: string[] = [
  'status',
  'roles',
  'roles.permissions',
  'tenants',
  'userRoles',
  'userRoles.userRoleScopes',
  'userRoles.role',
];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserStatus)
    private readonly userStatusRepository: Repository<UserStatus>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(UserTenant)
    private readonly userTenantRepository: Repository<UserTenant>,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly uploadService: UploadService,
  ) {}

  private resolveTenantId(tenantId?: string | null): string | null {
    if (!tenantId) {
      return null;
    }
    const normalized = String(tenantId).trim();
    return normalized.length > 0 ? normalized : null;
  }

  private async resolveDefaultTenantId(): Promise<string | null> {
    const tenant = await this.tenantRepository.findOne({
      where: { code: process.env.DEFAULT_TENANT_CODE || 'default' },
    });
    return tenant?.id ?? null;
  }

  private applyTenantMembershipScope(
    qb: SelectQueryBuilder<User>,
    tenantId?: string | null,
  ): void {
    const activeTenantId = this.resolveTenantId(tenantId);
    if (!activeTenantId) {
      return;
    }
    qb.andWhere(
      `EXISTS (
        SELECT 1
        FROM user_tenants ut
        WHERE ut.userId = user.id
          AND ut.tenantId = :tenantId
      )`,
      { tenantId: activeTenantId },
    );
  }

  async findAll(tenantId?: string | null): Promise<User[]> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.status', 'status')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .where('user.deletedAt IS NULL');
    this.applyTenantMembershipScope(qb, tenantId);
    this.applyExcludeSuperadminUsers(qb);
    return qb.getMany();
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = 'createdAt',
    descending: boolean = true,
    roleIds?: number[],
    userStatusIds?: number[],
    tenantId?: string | null,
    withDeleted: boolean = false,
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    const skip = (page - 1) * limit;

    // Build query builder for flexible search
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.status', 'status')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions');
    if (withDeleted) {
      queryBuilder.withDeleted().where('user.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('user.deletedAt IS NULL');
    }
    this.applyTenantMembershipScope(queryBuilder, tenantId);
    this.applyExcludeSuperadminUsers(queryBuilder);

    // Add search condition if provided
    if (search) {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (roleIds && roleIds.length > 0) {
      queryBuilder.andWhere(
        `EXISTS (
          SELECT 1
          FROM user_roles ur_filter
          WHERE ur_filter.userId = user.id
            AND ur_filter.roleId IN (:...roleIds)
        )`,
        { roleIds },
      );
    }

    if (userStatusIds && userStatusIds.length > 0) {
      queryBuilder.andWhere('status.id IN (:...userStatusIds)', {
        userStatusIds,
      });
    }

    // Validate and set sortBy field (prevent SQL injection)
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'username',
      'email',
      'firstName',
      'lastName',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = descending ? 'DESC' : 'ASC';

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated data
    const data = await queryBuilder
      .orderBy(`user.${sortField}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async findOne(
    id: string,
    tenantId?: string | null,
    withDeleted = false,
  ): Promise<User | null> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.status', 'status')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .leftJoinAndSelect('user.tenants', 'tenants')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.userRoleScopes', 'userRoleScopes')
      .leftJoinAndSelect('userRoles.role', 'userRoleRole')
      .where('user.id = :id', { id });
    if (withDeleted) {
      qb.withDeleted();
    } else {
      qb.andWhere('user.deletedAt IS NULL');
    }
    this.applyTenantMembershipScope(qb, tenantId);
    return qb.getOne();
  }

  async findByEmail(
    email: string,
    tenantId?: string | null,
    withDeleted = false,
  ): Promise<User | null> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.status', 'status')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .leftJoinAndSelect('user.tenants', 'tenants')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.userRoleScopes', 'userRoleScopes')
      .leftJoinAndSelect('userRoles.role', 'userRoleRole')
      .where('user.email = :email', { email });
    if (withDeleted) {
      qb.withDeleted();
    } else {
      qb.andWhere('user.deletedAt IS NULL');
    }
    this.applyTenantMembershipScope(qb, tenantId);
    return qb.getOne();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username, deletedAt: IsNull() },
      relations: USER_AUTH_LOAD_RELATIONS,
    });
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [
        { username: usernameOrEmail, deletedAt: IsNull() },
        { email: usernameOrEmail, deletedAt: IsNull() },
      ],
      relations: USER_AUTH_LOAD_RELATIONS,
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { googleId, deletedAt: IsNull() },
      relations: USER_AUTH_LOAD_RELATIONS,
    });
  }

  async create(
    userData: Partial<User> & { roleIds?: number[] },
    currentUser?: User,
    options?: { deferProfileCompletion?: boolean },
  ): Promise<User> {
    const targetTenantId =
      currentUser?.activeTenantId ?? (await this.resolveDefaultTenantId());
    if (!targetTenantId) {
      throw new BadRequestException(
        'Tenant default belum tersedia. Jalankan tenants seeder/migration.',
      );
    }

    // Extract roleIds before processing
    const roleIds = userData.roleIds;
    delete userData.roleIds; // Remove roleIds from userData before creating user

    // Business logic: Admin tidak bisa create user dengan role admin
    if (
      currentUser &&
      this.hasRole(currentUser, 'admin') &&
      !this.hasRole(currentUser, 'superadmin')
    ) {
      // Cek jika roleIds termasuk admin
      if (roleIds && Array.isArray(roleIds)) {
        const adminRole = await this.roleRepository.findOne({
          where: { code: 'admin' },
        });
        if (adminRole && roleIds.includes(adminRole.id)) {
          throw new ForbiddenException('Admin cannot create other admin users');
        }
      }
    }

    // Password user baru selalu menggunakan default password dari env.
    const defaultPassword =
      this.configService.get<string>('app.userPasswordDefault') ||
      'ChangeMe123!';
    const saltRounds = 10;
    userData.password = await bcrypt.hash(defaultPassword, saltRounds);

    // Set default status to 'active' if not provided
    if (!userData.statusId) {
      const activeStatus = await this.userStatusRepository.findOne({
        where: { code: 'active' },
      });
      if (activeStatus) {
        userData.statusId = activeStatus.id;
      }
    }

    if (!options?.deferProfileCompletion) {
      const ph = (userData.phone ?? '').toString().trim();
      if (!ph || ph.length < 8) {
        throw new BadRequestException(
          'Phone wajib diisi (minimal 8 karakter) untuk pendaftaran user.',
        );
      }
      userData.phone = ph;
      const fn = (userData.firstName ?? '').toString().trim();
      if (!fn) {
        throw new BadRequestException(
          'First name wajib diisi untuk pendaftaran user.',
        );
      }
      userData.firstName = fn;
      if (userData.completedAt === undefined || userData.completedAt === null) {
        (userData as Partial<User>).completedAt = new Date();
      }
    }

    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);

    const existingMembership = await this.userTenantRepository.findOne({
      where: { userId: savedUser.id, tenantId: targetTenantId },
    });
    if (!existingMembership) {
      const membership = this.userTenantRepository.create({
        userId: savedUser.id,
        tenantId: targetTenantId,
      });
      await this.userTenantRepository.save(membership);
    }

    // Assign roles if provided
    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      await this.assertSuperadminNotNewlyAssigned(roleIds, null);
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
      });
      savedUser.roles = roles;
      await this.userRepository.save(savedUser);
    }

    const result = await this.findOne(savedUser.id, targetTenantId);
    if (!result) {
      throw new Error('User not found after creation');
    }
    return result;
  }

  async update(
    id: string,
    userData: Partial<User> & { roleIds?: number[] },
    currentUser?: User,
    options?: { skipTenantMembershipForLookup?: boolean },
  ): Promise<User | null> {
    const lookupTenantId = options?.skipTenantMembershipForLookup
      ? null
      : currentUser?.activeTenantId;
    const targetUser = await this.findOne(id, lookupTenantId);
    if (!targetUser) {
      return null;
    }

    if (targetUser.status?.code === 'inactive') {
      throw new BadRequestException(
        'User dengan status inactive tidak dapat diupdate. Hanya boleh read atau delete.',
      );
    }

    // Business logic: Admin tidak bisa update superadmin
    if (
      currentUser &&
      this.hasRole(currentUser, 'admin') &&
      !this.hasRole(currentUser, 'superadmin')
    ) {
      if (this.hasRole(targetUser, 'superadmin')) {
        throw new ForbiddenException('Admin cannot update superadmin');
      }
    }

    // Extract roleIds before processing
    const roleIds = userData.roleIds;
    delete userData.roleIds; // Remove roleIds from userData before updating

    if (userData.statusId !== undefined) {
      const nextStatus = await this.userStatusRepository.findOne({
        where: { id: Number(userData.statusId) },
      });
      if (!nextStatus) {
        throw new BadRequestException('Status tidak valid.');
      }
      if (nextStatus.code === 'inactive') {
        throw new BadRequestException(
          'Status inactive tidak boleh dipilih dari update user.',
        );
      }
    }

    const avatar = (userData as { avatar?: Promise<FileUpload> }).avatar;
    delete (userData as any).avatar;

    const touchesProfileScalars =
      (userData as Partial<User>).firstName !== undefined ||
      (userData as Partial<User>).lastName !== undefined ||
      (userData as Partial<User>).phone !== undefined;
    if (touchesProfileScalars) {
      const ph = (userData.phone ?? '').toString().trim();
      if (!ph || ph.length < 8) {
        throw new BadRequestException(
          'Phone wajib diisi (minimal 8 karakter) saat memperbarui data profil.',
        );
      }
      (userData as Partial<User>).phone = ph;

      let effectiveFirst = (targetUser.firstName ?? '').toString().trim();
      if ((userData as Partial<User>).firstName !== undefined) {
        const patched = ((userData as Partial<User>).firstName ?? '').toString().trim();
        (userData as Partial<User>).firstName = patched.length > 0 ? patched : null;
        effectiveFirst = patched;
      }
      if (!effectiveFirst) {
        throw new BadRequestException(
          'First name wajib diisi (minimal 1 karakter) saat memperbarui data profil.',
        );
      }
    }

    // Prevent updating immutable identity fields
    delete (userData as any).username;
    delete (userData as any).email;
    delete (userData as any).googleId;

    // Password tidak boleh diupdate dari mutation usersUpdate.
    delete (userData as any).password;

    let uploadedAvatarUrl: string | null = null;
    if (avatar) {
      const file = await avatar;
      uploadedAvatarUrl = await this.uploadService.saveAvatarFromUpload(
        file,
        id,
        { isPublicUpload: false },
      );
      (userData as any).avatarUrl = uploadedAvatarUrl;
    }

    try {
      await this.userRepository.update(id, userData);
    } catch (err) {
      if (uploadedAvatarUrl) {
        try {
          await this.uploadService.deleteStoredUploadByUrl(uploadedAvatarUrl);
        } catch {
          /* best effort */
        }
      }
      throw err;
    }

    // Update roles if provided
    if (roleIds && Array.isArray(roleIds)) {
      await this.assertSuperadminNotNewlyAssigned(roleIds, targetUser);
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
      });
      targetUser.roles = roles;
      await this.userRepository.save(targetUser);
    }

    await this.invalidateUserCache(id);
    return this.findOne(id, lookupTenantId);
  }

  /**
   * Self profile update: only the authenticated user's row (currentUser.id).
   * Does not use permission checks beyond JWT; delegates to `update` for field sanitization.
   * Avatar diubah lewat `updateOwnAvatar`.
   */
  async updateOwnProfile(
    currentUser: User,
    input: {
      firstName: string;
      lastName?: string | null;
      phone?: string | null;
    },
  ): Promise<User | null> {
    const phoneTrimmed = (input.phone ?? '').toString().trim();
    if (!phoneTrimmed || phoneTrimmed.length < 8) {
      throw new BadRequestException(
        'Phone wajib diisi (minimal 8 karakter) untuk memperbarui profil.',
      );
    }

    const firstTrimmed = (input.firstName ?? '').toString().trim();
    if (!firstTrimmed) {
      throw new BadRequestException(
        'First name wajib diisi (minimal 1 karakter) untuk memperbarui profil.',
      );
    }

    const payload: Partial<User> = {
      phone: phoneTrimmed,
      firstName: firstTrimmed,
    };
    if (input.lastName !== undefined) {
      if (input.lastName === null) {
        payload.lastName = null;
      } else {
        const trimmed = String(input.lastName).trim();
        payload.lastName = trimmed.length > 0 ? trimmed : null;
      }
    }
    // Own row by id: do not scope findOne by tenant — membership can be missing/out of sync while JWT still has activeTenantId.
    return this.update(currentUser.id, payload, currentUser, {
      skipTenantMembershipForLookup: true,
    });
  }

  /**
   * Ganti avatar user yang sedang login; `userId` dari JWT saja.
   */
  async updateOwnAvatar(
    currentUser: User,
    file: FileUpload,
    isPublicUpload: boolean,
  ): Promise<User | null> {
    const targetUser = await this.findOne(currentUser.id, null);
    if (!targetUser) {
      return null;
    }
    const previousUrl = targetUser.avatarUrl;
    let uploadedAvatarUrl: string | null = null;
    try {
      uploadedAvatarUrl = await this.uploadService.saveAvatarFromUpload(
        file,
        currentUser.id,
        { isPublicUpload },
      );
      await this.userRepository.update(currentUser.id, {
        avatarUrl: uploadedAvatarUrl,
      });
      if (previousUrl && previousUrl !== uploadedAvatarUrl) {
        try {
          await this.uploadService.deleteStoredUploadByUrl(previousUrl);
        } catch {
          /* best effort */
        }
      }
      await this.invalidateUserCache(currentUser.id);
      return this.findOne(currentUser.id, null);
    } catch (err) {
      if (uploadedAvatarUrl) {
        try {
          await this.uploadService.deleteStoredUploadByUrl(uploadedAvatarUrl);
        } catch {
          /* best effort */
        }
      }
      throw err;
    }
  }

  /**
   * Hapus avatar user yang sedang login (penyimpanan + kolom `avatarUrl`).
   */
  async deleteOwnAvatar(currentUser: User): Promise<User | null> {
    const targetUser = await this.findOne(currentUser.id, null);
    if (!targetUser) {
      return null;
    }
    const previousUrl = targetUser.avatarUrl;
    if (!previousUrl) {
      return targetUser;
    }
    try {
      await this.uploadService.deleteStoredUploadByUrl(previousUrl);
    } catch {
      /* best effort */
    }
    await this.userRepository.update(currentUser.id, { avatarUrl: null });
    await this.invalidateUserCache(currentUser.id);
    return this.findOne(currentUser.id, null);
  }

  /** Printable ASCII symbols allowed to satisfy “must contain a symbol”. */
  private static readonly NEW_PASSWORD_SYMBOL_RE =
    /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;

  /**
   * New password for self-service change: min 8 chars, at least one digit, one symbol.
   */
  private assertNewPasswordPolicy(newPassword: string): void {
    if (newPassword.length < 8) {
      throw new BadRequestException(
        'New password must be at least 8 characters',
      );
    }
    if (!/[0-9]/.test(newPassword)) {
      throw new BadRequestException(
        'New password must contain at least one number',
      );
    }
    if (!UsersService.NEW_PASSWORD_SYMBOL_RE.test(newPassword)) {
      throw new BadRequestException(
        'New password must contain at least one symbol',
      );
    }
  }

  /**
   * Self-service password change (local accounts only; SSO-linked users cannot use this).
   */
  async changeOwnPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.googleId) {
      throw new BadRequestException(
        'Password cannot be changed for accounts registered via SSO.',
      );
    }
    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      throw new BadRequestException('Current password is incorrect');
    }
    this.assertNewPasswordPolicy(newPassword);
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must differ from the current password',
      );
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await this.userRepository.update(userId, { password: hashedPassword });
    await this.invalidateUserCache(userId);
  }

  async remove(id: string, currentUser?: User): Promise<void> {
    const targetUser = await this.findOne(id, currentUser?.activeTenantId);
    if (!targetUser) {
      return;
    }

    // Business logic: Admin hanya bisa delete non-admin users
    if (
      currentUser &&
      this.hasRole(currentUser, 'admin') &&
      !this.hasRole(currentUser, 'superadmin')
    ) {
      // Cek jika targetUser memiliki role admin atau superadmin
      if (
        this.hasRole(targetUser, 'admin') ||
        this.hasRole(targetUser, 'superadmin')
      ) {
        throw new ForbiddenException('Admin can only delete non-admin users');
      }
    }

    // Soft delete
    await this.userRepository.softDelete(id);
    await this.invalidateUserCache(id);
  }

  async restore(id: string, currentUser?: User): Promise<User | null> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.status', 'status')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.id = :id', { id })
      .withDeleted();
    this.applyTenantMembershipScope(qb, currentUser?.activeTenantId ?? null);
    this.applyExcludeSuperadminUsers(qb);
    const target = await qb.getOne();
    if (!target || !target.deletedAt) {
      return target && !target.deletedAt
        ? this.findOne(id, currentUser?.activeTenantId)
        : null;
    }

    if (
      currentUser &&
      this.hasRole(currentUser, 'admin') &&
      !this.hasRole(currentUser, 'superadmin')
    ) {
      if (this.hasRole(target, 'admin') || this.hasRole(target, 'superadmin')) {
        throw new ForbiddenException('Admin can only restore non-admin users');
      }
    }

    await this.userRepository.restore(id);
    await this.invalidateUserCache(id);
    return this.findOne(id, currentUser?.activeTenantId);
  }

  /**
   * Hapus permanen user yang **sudah** soft-deleted. Baris pivot dengan ON DELETE CASCADE ikut DB.
   */
  async forceDelete(id: string, currentUser?: User): Promise<void> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.id = :id', { id })
      .withDeleted();
    this.applyTenantMembershipScope(qb, currentUser?.activeTenantId ?? null);
    this.applyExcludeSuperadminUsers(qb);
    const target = await qb.getOne();
    if (!target) {
      throw new NotFoundException('User tidak ditemukan');
    }
    if (!target.deletedAt) {
      throw new BadRequestException(
        'Penghapusan permanen hanya untuk user yang sudah di-soft-delete.',
      );
    }
    if (
      currentUser &&
      this.hasRole(currentUser, 'admin') &&
      !this.hasRole(currentUser, 'superadmin')
    ) {
      if (this.hasRole(target, 'admin') || this.hasRole(target, 'superadmin')) {
        throw new ForbiddenException(
          'Admin can only force-delete non-admin users',
        );
      }
    }
    if (target.avatarUrl) {
      try {
        await this.uploadService.deleteStoredUploadByUrl(target.avatarUrl);
      } catch {
        /* best effort */
      }
    }
    try {
      await this.userRepository
        .createQueryBuilder()
        .delete()
        .from(User)
        .where('id = :id', { id })
        .execute();
    } catch (err) {
      assertNoForeignKeyViolation(err);
    }
    await this.invalidateUserCache(id);
  }

  private async applyDefaultPasswordFromConfig(userId: string): Promise<void> {
    const defaultPassword =
      this.configService.get<string>('app.userPasswordDefault') ||
      'ChangeMe123!';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
    await this.userRepository.update(userId, { password: hashedPassword });
    await this.invalidateUserCache(userId);
  }

  async resetPassword(id: string, currentUser?: User): Promise<User | null> {
    const targetUser = await this.findOne(id, currentUser?.activeTenantId);
    if (!targetUser) {
      return null;
    }

    // Business logic: Admin tidak bisa reset password superadmin
    if (
      currentUser &&
      this.hasRole(currentUser, 'admin') &&
      !this.hasRole(currentUser, SUPERADMIN_ROLE_CODE) &&
      this.hasRole(targetUser, SUPERADMIN_ROLE_CODE)
    ) {
      throw new ForbiddenException('Admin cannot reset superadmin password');
    }

    await this.applyDefaultPasswordFromConfig(id);
    return this.findOne(id, currentUser?.activeTenantId);
  }

  /**
   * Admin/superadmin: reset password **another** user in the **active** tenant to
   * `app.userPasswordDefault` (`USER_PASSWORD_DEFAULT`). Self-reset must use `resetPassword` via `usersOwnResetPassword`.
   */
  async resetPasswordForUser(id: string, currentUser: User): Promise<User | null> {
    const tenantId = currentUser.activeTenantId;
    if (!tenantId) {
      throw new BadRequestException(
        'Tenant context is required. Please select active tenant first.',
      );
    }
    if (id === currentUser.id) {
      throw new ForbiddenException(
        'Cannot reset your own password here. Use usersOwnResetPassword.',
      );
    }
    const targetUser = await this.findOne(id, tenantId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }
    if (
      this.hasRole(currentUser, 'admin') &&
      !this.hasRole(currentUser, SUPERADMIN_ROLE_CODE)
    ) {
      if (
        this.hasRole(targetUser, 'admin') ||
        this.hasRole(targetUser, SUPERADMIN_ROLE_CODE)
      ) {
        throw new ForbiddenException(
          'Admin can only reset passwords for non-admin users',
        );
      }
    }
    await this.applyDefaultPasswordFromConfig(id);
    return this.findOne(id, tenantId);
  }

  async assignRoles(
    userId: string,
    roleIds: number[],
    tenantId?: string | null,
  ): Promise<User | null> {
    const activeTenantId = this.resolveTenantId(tenantId);
    if (!activeTenantId) {
      throw new BadRequestException('tenantId wajib diisi untuk assign role');
    }
    const user = await this.findOne(userId, activeTenantId);

    if (!user) {
      return null;
    }

    if (!roleIds || roleIds.length === 0) {
      user.roles = [];
      await this.userRepository.save(user);
      await this.invalidateUserCache(userId);
      return this.findOne(userId, activeTenantId);
    }

    await this.assertSuperadminNotNewlyAssigned(roleIds, user);

    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
    });

    user.roles = roles;
    await this.userRepository.save(user);
    await this.invalidateUserCache(userId);
    return this.findOne(userId, activeTenantId);
  }

  async createFromGoogle(googleUser: {
    googleId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    const defaultPassword =
      this.configService.get<string>('app.userPasswordDefault') ||
      'ChangeMe123!';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    const activeStatus = await this.userStatusRepository.findOne({
      where: { code: 'active' },
    });

    // Generate username from email (before @)
    const username = googleUser.email.split('@')[0];

    const userData = {
      googleId: googleUser.googleId,
      email: googleUser.email,
      username: username,
      password: hashedPassword,
      firstName: googleUser.firstName || null,
      lastName: googleUser.lastName || null,
      statusId: activeStatus?.id || 1,
      isEmailVerified: true,
    };

    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  private async buildUniqueUsername(base: string): Promise<string> {
    let candidate = base || `user${Date.now()}`;
    let suffix = 0;
    // Batas aman untuk menghindari loop tidak terbatas.
    while (suffix < 1000) {
      const exists = await this.userRepository.findOne({
        where: { username: candidate },
      });
      if (!exists) return candidate;
      suffix += 1;
      candidate = `${base}${suffix}`;
    }
    return `${base}${Date.now()}`;
  }

  /**
   * Onboarding SSO (eksternal): set phone, username (konfirmasi), dan `completedAt`.
   */
  async completeSsoOnboarding(
    userId: string,
    input: {
      firstName: string;
      lastName?: string | null;
      username: string;
      phone: string;
    },
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User tidak ditemukan.');
    }
    if (!user.googleId?.trim()) {
      throw new BadRequestException('Bukan akun Google.');
    }
    if (user.completedAt) {
      throw new BadRequestException('Onboarding sudah diselesaikan.');
    }

    const firstName = input.firstName.trim();
    if (!firstName) {
      throw new BadRequestException('First name wajib diisi.');
    }
    if (firstName.length > 255) {
      throw new BadRequestException('First name terlalu panjang.');
    }

    const lastNameRaw = input.lastName;
    const lastName =
      lastNameRaw === undefined || lastNameRaw === null
        ? null
        : String(lastNameRaw).trim() || null;
    if (lastName && lastName.length > 255) {
      throw new BadRequestException('Last name terlalu panjang.');
    }

    const phone = input.phone.trim();
    if (phone.length < 8 || phone.length > 20) {
      throw new BadRequestException('Nomor telepon harus 8–20 karakter.');
    }
    if (!/^\+?[0-9][0-9\s-]{7,19}$/.test(phone)) {
      throw new BadRequestException('Nomor telepon tidak valid.');
    }

    const username = input.username.trim();
    if (username.length < 3 || username.length > 100) {
      throw new BadRequestException('Username harus 3–100 karakter.');
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      throw new BadRequestException(
        'Username hanya boleh huruf, angka, titik, garis bawah, dan tanda hubung.',
      );
    }

    if (username !== user.username) {
      const taken = await this.userRepository.findOne({ where: { username } });
      if (taken) {
        throw new BadRequestException('Username sudah dipakai.');
      }
    }

    const activeStatus = await this.getStatusByCode('active');
    if (!activeStatus) {
      throw new BadRequestException(
        'Status active tidak ditemukan. Jalankan seeder user statuses.',
      );
    }

    await this.userRepository.update(userId, {
      firstName,
      lastName,
      username,
      phone,
      statusId: activeStatus.id,
      completedAt: new Date(),
      lastLoginAt: new Date(),
    });
    await this.invalidateUserCache(userId);
  }

  async syncFromGoogle(profile: {
    googleId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isEmailVerified?: boolean;
    picture?: string | null;
  }): Promise<User> {
    const defaultPassword =
      this.configService.get<string>('app.userPasswordDefault') ||
      'ChangeMe123!';

    const googleAvatarUrl = googleProfilePictureUrl(profile.picture);

    let user =
      (await this.findByGoogleId(profile.googleId)) ||
      (await this.findByEmail(profile.email));

    if (!user) {
      const baseUsername = profile.email.split('@')[0]?.trim() || 'user';
      const username = await this.buildUniqueUsername(baseUsername);
      const inactiveStatus = await this.getStatusByCode('inactive');
      if (!inactiveStatus) {
        throw new BadRequestException(
          'Status inactive tidak ditemukan. Jalankan seeder user statuses.',
        );
      }
      user = await this.create(
        {
          username,
          email: profile.email,
          password: defaultPassword,
          firstName: profile.firstName || null,
          lastName: profile.lastName || null,
          // Keep using existing identity column for external SSO subject.
          googleId: profile.googleId,
          statusId: inactiveStatus.id,
          isEmailVerified: profile.isEmailVerified ?? true,
          ...(googleAvatarUrl ? { avatarUrl: googleAvatarUrl } : {}),
        },
        undefined,
        { deferProfileCompletion: true },
      );
      return user;
    }

    await this.userRepository.update(user.id, {
      firstName: profile.firstName || user.firstName || null,
      lastName: profile.lastName || user.lastName || null,
      googleId: profile.googleId,
      isEmailVerified: profile.isEmailVerified ?? user.isEmailVerified,
      lastLoginAt: new Date(),
      ...(googleAvatarUrl && !user.avatarUrl?.trim()
        ? { avatarUrl: googleAvatarUrl }
        : {}),
    });
    await this.invalidateUserCache(user.id);

    const fresh = await this.findOne(user.id);
    if (!fresh) {
      throw new Error('User not found after Google sync');
    }
    return fresh;
  }

  /** Hapus cache JWT user (panggil juga dari modul lain setelah mengubah role/scope). */
  async invalidateUserCache(userId: string): Promise<void> {
    if (this.redisService.isAvailable()) {
      await this.redisService.del(`user:${userId}`);
    }
  }

  /**
   * Hapus cache Redis untuk semua user yang punya roleId (mis. setelah assignPermissions ke role).
   */
  async invalidateUserCacheForUsersHavingRole(roleId: number): Promise<void> {
    if (!this.redisService.isAvailable()) {
      return;
    }
    const rows = await this.userRepository.manager
      .createQueryBuilder()
      .select('ur.userId', 'userId')
      .from('user_roles', 'ur')
      .where('ur.roleId = :roleId', { roleId })
      .getRawMany<{ userId: string }>();
    const uniqueUserIds = [...new Set(rows.map((r) => r.userId))];
    for (const userId of uniqueUserIds) {
      await this.invalidateUserCache(userId);
    }
  }

  // Helper method to get status by code
  async findAllStatuses(): Promise<UserStatus[]> {
    return this.userStatusRepository.find({
      where: { isActive: true },
      order: {
        id: 'ASC',
      },
    }).then((rows) => rows.filter((row) => row.code !== 'inactive'));
  }

  // Helper method to get status by code
  async getStatusByCode(code: string): Promise<UserStatus | null> {
    return this.userStatusRepository.findOne({
      where: { code },
    });
  }

  /**
   * User management: akun superadmin tidak ditampilkan ke user lain (bukan untuk JWT/findOne internal).
   */
  shouldHideUserFromViewer(target: User | null, viewerUserId: string): boolean {
    if (!target) {
      return false;
    }
    return (
      this.hasRole(target, SUPERADMIN_ROLE_CODE) && target.id !== viewerUserId
    );
  }

  private applyExcludeSuperadminUsers(qb: SelectQueryBuilder<User>): void {
    qb.andWhere(
      `user.id NOT IN (
        SELECT ur.userId FROM user_roles ur
        INNER JOIN roles r ON r.id = ur.roleId
        WHERE r.code = :_excludeSuperadminCode
      )`,
      { _excludeSuperadminCode: SUPERADMIN_ROLE_CODE },
    );
  }

  // Helper methods for role/permission checks
  hasRole(user: User, roleCode: string): boolean {
    if (!user.roles) {
      return false;
    }
    return user.roles.some((role) => role.code === roleCode);
  }

  hasPermission(user: User, permissionCode: string): boolean {
    if (!user.roles) {
      return false;
    }
    for (const role of user.roles) {
      if (role.permissions) {
        if (role.permissions.some((p) => p.code === permissionCode)) {
          return true;
        }
      }
    }
    return false;
  }

  hasAnyPermission(user: User, permissionCodes: string[]): boolean {
    return permissionCodes.some((code) => this.hasPermission(user, code));
  }

  async findRoleByCode(code: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { code } });
  }

  /**
   * Superadmin hanya untuk akun sistem; tidak boleh ditambahkan lewat assignRoles.
   * User yang sudah punya superadmin boleh mengirim kembali id role tersebut (mis. edit profil).
   */
  private async assertSuperadminNotNewlyAssigned(
    roleIds: number[],
    targetUser: User | null,
  ): Promise<void> {
    const superadminRole = await this.roleRepository.findOne({
      where: { code: SUPERADMIN_ROLE_CODE },
    });
    if (!superadminRole || !roleIds.includes(superadminRole.id)) {
      return;
    }
    const alreadyHadSuperadmin =
      targetUser?.roles?.some((r) => r.code === SUPERADMIN_ROLE_CODE) ?? false;
    if (!alreadyHadSuperadmin) {
      throw new BadRequestException(
        'Role superadmin tidak dapat ditetapkan lewat penugasan role.',
      );
    }
  }

  // Methods for role assignment are now centralized via assignRoles (using array roleIds)
}
