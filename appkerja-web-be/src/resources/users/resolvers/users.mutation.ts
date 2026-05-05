import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from '../users.service.js';
import { User } from '../entities/user.entity.js';
import {
  UserCreateInput,
  UserUpdateInput,
  UserAssignRolesInput,
  UsersOwnUpdateProfileInput,
  UsersOwnAvatarUpdateInput,
} from '../dto/index.js';
import { PermissionsGuard, RolesGuard } from '../../auth/guards/index.js';
import { Permissions, Roles, CurrentUser } from '../../auth/decorators/index.js';

@Resolver(() => User)
export class UsersMutation {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  @UseGuards(PermissionsGuard)
  @Permissions('users.create')
  async usersCreate(
    @Args('userCreateInput') userCreateInput: UserCreateInput,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    return this.usersService.create(userCreateInput, currentUser);
  }

  @Mutation(() => User, { nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('users.update')
  async usersUpdate(
    @Args('id', { type: () => ID }) id: string,
    @Args('userUpdateInput') userUpdateInput: UserUpdateInput,
    @CurrentUser() currentUser: User,
  ): Promise<User | null> {
    return this.usersService.update(id, userUpdateInput, currentUser);
  }

  @Mutation(() => User, {
    name: 'usersOwnUpdateProfile',
    nullable: true,
    description:
      'Update profil user yang sedang login (nama, telepon). Tanpa upload file; JWT wajib.',
  })
  async usersOwnUpdateProfile(
    @Args('usersOwnUpdateProfileInput')
    usersOwnUpdateProfileInput: UsersOwnUpdateProfileInput,
    @CurrentUser() currentUser: User,
  ): Promise<User | null> {
    return this.usersService.updateOwnProfile(
      currentUser,
      usersOwnUpdateProfileInput,
    );
  }

  @Mutation(() => User, {
    name: 'usersOwnAvatarUpdate',
    nullable: true,
    description:
      'Ganti avatar user yang sedang login. JWT wajib. `isPublicUpload` memilih bucket S3.',
  })
  async usersOwnAvatarUpdate(
    @Args('usersOwnAvatarUpdateInput')
    usersOwnAvatarUpdateInput: UsersOwnAvatarUpdateInput,
    @CurrentUser() currentUser: User,
  ): Promise<User | null> {
    const file = await usersOwnAvatarUpdateInput.fileUpload;
    const isPublic = usersOwnAvatarUpdateInput.isPublicUpload === true;
    return this.usersService.updateOwnAvatar(currentUser, file, isPublic);
  }

  @Mutation(() => User, {
    name: 'usersOwnAvatarDelete',
    nullable: true,
    description: 'Hapus avatar user yang sedang login. JWT wajib.',
  })
  async usersOwnAvatarDelete(
    @CurrentUser() currentUser: User,
  ): Promise<User | null> {
    return this.usersService.deleteOwnAvatar(currentUser);
  }

  @Mutation(() => Boolean, { name: 'usersDelete' })
  @UseGuards(PermissionsGuard)
  @Permissions('users.delete')
  async usersDelete(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    await this.usersService.remove(id, currentUser);
    return true;
  }

  @Mutation(() => Boolean, { name: 'usersForceDelete' })
  @UseGuards(PermissionsGuard)
  @Permissions('users.force_delete')
  async usersForceDelete(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    await this.usersService.forceDelete(id, currentUser);
    return true;
  }

  @Mutation(() => User, {
    name: 'usersRestore',
    nullable: true,
  })
  @UseGuards(PermissionsGuard)
  @Permissions('users.restore')
  async usersRestore(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<User | null> {
    return this.usersService.restore(id, currentUser);
  }

  @Mutation(() => User, {
    name: 'usersAssignRoles',
    nullable: true,
  })
  @UseGuards(PermissionsGuard)
  @Permissions('users.update')
  async usersAssignRoles(
    @CurrentUser() currentUser: User,
    @Args('userAssignRolesInput') userAssignRolesInput: UserAssignRolesInput,
  ): Promise<User | null> {
    return this.usersService.assignRoles(
      userAssignRolesInput.userId,
      userAssignRolesInput.roleIds,
      currentUser.activeTenantId,
    );
  }

  @Mutation(() => User, {
    name: 'usersOwnResetPassword',
    nullable: true,
    description:
      'Reset password user yang sedang login ke nilai default aplikasi. JWT wajib (tanpa permission users.update).',
  })
  async usersOwnResetPassword(
    @CurrentUser() currentUser: User,
  ): Promise<User | null> {
    return this.usersService.resetPassword(currentUser.id, currentUser);
  }

  @Mutation(() => User, {
    name: 'usersResetPassword',
    nullable: true,
    description:
      'Reset password user lain di tenant aktif ke nilai `USER_PASSWORD_DEFAULT`. `@Roles(admin)`: hanya role admin; superadmin tetap boleh (bypass RolesGuard, sama seperti PermissionsGuard). Target dalam tenant yang sama; bukan diri sendiri (pakai `usersOwnResetPassword`).',
  })
  @UseGuards(RolesGuard)
  @Roles('admin')
  async usersResetPassword(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<User | null> {
    return this.usersService.resetPasswordForUser(id, currentUser);
  }
}
