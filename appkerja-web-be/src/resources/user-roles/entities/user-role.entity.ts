import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity.js';
import { Role } from '../../roles/entities/role.entity.js';
import { UserRoleScope } from './user-role-scope.entity.js';

@ObjectType()
@Entity('user_roles')
@Index(['userId', 'roleId'], { unique: true })
export class UserRole {
  @Field(() => Int)
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Field()
  @Column({ type: 'char', length: 36, nullable: false })
  userId: string;

  @Field(() => Int)
  @Column({ type: 'int', nullable: false })
  roleId: number;

  @Field(() => String)
  @Column({ type: 'char', length: 36, nullable: true })
  @Index()
  tenantId: string | null;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: Relation<User>;

  @Field(() => Role, { nullable: true })
  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role?: Relation<Role>;

  @Field(() => [UserRoleScope], { nullable: true })
  @OneToMany(() => UserRoleScope, (scope) => scope.userRole)
  userRoleScopes?: Relation<UserRoleScope[]>;

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
