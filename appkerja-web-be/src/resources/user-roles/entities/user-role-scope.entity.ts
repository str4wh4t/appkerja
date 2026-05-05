import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserRole } from './user-role.entity.js';

/** Scope per pasangan user–role: FK ke baris `user_roles`, bukan ke `users` / `roles` langsung. */
@ObjectType()
@Entity('user_role_scopes')
@Index(['userRoleId', 'scopeType', 'scopeId'], { unique: true })
export class UserRoleScope {
  @Field(() => Int)
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Field(() => Int)
  @Column({ type: 'int', nullable: false })
  @Index()
  userRoleId: number;

  @Field(() => UserRole)
  @ManyToOne(() => UserRole, (ur) => ur.userRoleScopes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userRoleId' })
  userRole: Relation<UserRole>;

  @Field()
  @Column({ type: 'varchar', length: 50, nullable: false })
  @Index()
  scopeType: string;

  @Field()
  @Column({ type: 'varchar', length: 100, nullable: false })
  @Index()
  scopeId: string;

  /** Resolved display label for `scopeType` + `scopeId` (e.g. `UNIT_CODE — UNIT_NAME`). */
  @Field(() => String, { nullable: true })
  scope?: string | null;

  @Field(() => String)
  @Column({ type: 'char', length: 36, nullable: false })
  @Index()
  tenantId: string;

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
