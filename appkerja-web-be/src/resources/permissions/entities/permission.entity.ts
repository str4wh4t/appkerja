import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  type Relation,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Role } from '../../roles/entities/role.entity.js';

@ObjectType()
@Entity('permissions')
@Index(['code'], { unique: true })
export class Permission {
  @Field(() => Int)
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  @Index()
  code: string; // 'users.create', 'users.read', 'units.update', dll

  @Field()
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string; // 'Create User', 'Read User', 'Update Unit', dll

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Field()
  @Column({ type: 'varchar', length: 50, nullable: false })
  @Index()
  resource: string; // 'users', 'units', 'roles', 'permissions'

  @Field()
  @Column({ type: 'varchar', length: 50, nullable: false })
  @Index()
  action: string; // 'create', 'read', 'update', 'delete'

  @Field(() => [Role])
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Relation<Role[]>;

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
