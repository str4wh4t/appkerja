import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  type Relation,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { UserStatus } from './user-status.entity.js';
import { Role } from '../../roles/entities/role.entity.js';
import { UserRole } from '../../user-roles/entities/user-role.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { computeUserFullname } from '../user-fullname.util.js';
import { computeNeedsGoogleProfileCompletion } from '../user-needs-google-profile-completion.util.js';

@ObjectType()
@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 100, nullable: false })
  @Index()
  username: string;

  @Field()
  @Column({ type: 'varchar', length: 255, nullable: false })
  @Index()
  email: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  @Index()
  googleId: string | null; // Google subject ID

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string; // Diisi dengan default password untuk akun SSO/local

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl: string | null;

  // Virtual/computed property for fullname (logika di `computeUserFullname`)
  @Field(() => String, { nullable: true })
  get fullname(): string | null {
    return computeUserFullname(this.firstName, this.lastName);
  }

  @Field(() => Int)
  @Column({ type: 'int', nullable: false })
  statusId: number;

  @Field(() => UserStatus)
  @ManyToOne(() => UserStatus, { eager: true })
  @JoinColumn({ name: 'statusId' })
  status: Relation<UserStatus>;

  @Field()
  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  /**
   * Profil/registrasi dianggap selesai (non-Google: di-set saat create; Google: setelah onboarding).
   * Null untuk akun Google baru yang belum menyelesaikan langkah onboarding.
   */
  @Field(() => Date, {
    nullable: true,
    description:
      'Waktu penyelesaian profil/registrasi. Null untuk akun Google yang belum onboarding.',
  })
  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Field(() => Boolean, {
    description:
      'True jika akun Google dan belum menyelesaikan onboarding (wajib phone + username).',
  })
  get needsGoogleProfileCompletion(): boolean {
    return computeNeedsGoogleProfileCompletion({
      googleId: this.googleId,
      completedAt: this.completedAt,
    });
  }

  @Field(() => [Role])
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Relation<Role[]>;

  @Field(() => [Tenant])
  @ManyToMany(() => Tenant, (tenant) => tenant.users)
  @JoinTable({
    name: 'user_tenants',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tenantId', referencedColumnName: 'id' },
  })
  tenants: Relation<Tenant[]>;

  /**
   * Entity `UserRole` = baris tabel `user_roles` (userId + roleId + id).
   * `user_role_scopes` melekat ke **user_roles**, bukan langsung ke User/Role.
   * Tidak di-expose GraphQL — untuk JWT/Redis. Jangan load `userRoles.user` (sirkular).
   */
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: Relation<UserRole[]>;

  /**
   * Konteks UI: diisi dari claim JWT access oleh JwtStrategy (bukan kolom DB).
   */
  @Field(() => String, {
    nullable: true,
    description:
      'Role code aktif untuk tampilan menu (dari JWT). Tidak mengubah union permission.',
  })
  activeRoleCode?: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'Tenant aktif dari claim JWT untuk konteks data tenancy.',
  })
  activeTenantId?: string | null;

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null; // Tidak expose ke GraphQL
}
