import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  JoinTable,
  type Relation,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Permission } from '../../permissions/entities/permission.entity.js';
import { User } from '../../users/entities/user.entity.js';

/** Kode role superadmin; tidak disertakan di `rolesFindAll` (matrix permission / daftar role UI). */
export const SUPERADMIN_ROLE_CODE = 'superadmin';

@ObjectType()
@Entity('roles')
@Index(['code'], { unique: true })
export class Role {
  @Field(() => Int)
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  @Index()
  code: string; // 'superadmin', 'admin', 'operator'

  @Field()
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string; // 'Super Admin', 'Admin', 'Operator'

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Field()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Field(() => [Permission])
  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Relation<Permission[]>;

  @ManyToMany(() => User, (user) => user.roles)
  users: Relation<User[]>;

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
}
