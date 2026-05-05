import { Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { AuthService } from '../auth.service.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { AuthSessionType } from '../dto/auth-session.type.js';

@Resolver()
export class AuthQuery {
  constructor(private readonly authService: AuthService) {}

  @Query(() => [Tenant], {
    name: 'authMyTenants',
    description:
      'Mengambil daftar tenant yang bisa diakses user saat ini (superadmin: semua tenant).',
  })
  async authMyTenants(@CurrentUser() currentUser: User): Promise<Tenant[]> {
    return this.authService.findAccessibleTenants(currentUser);
  }

  @Query(() => Tenant, {
    name: 'authActiveTenant',
    nullable: true,
    description: 'Mengambil tenant aktif dari claim JWT saat ini.',
  })
  async authActiveTenant(@CurrentUser() currentUser: User): Promise<Tenant | null> {
    return this.authService.findActiveTenant(currentUser);
  }

  @Query(() => [AuthSessionType], {
    name: 'authMySessions',
    description: 'Daftar session perangkat aktif user saat ini.',
  })
  async authMySessions(
    @CurrentUser() currentUser: User,
  ): Promise<AuthSessionType[]> {
    return this.authService.listMySessions(
      currentUser as User & { jwtSessionId?: string | null },
    );
  }
}
