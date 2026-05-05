import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity.js';

@ObjectType()
@Entity('auth_sessions')
@Index(['userId'])
@Index(['expiresAt'])
@Index(['revokedAt'])
export class AuthSession {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'char', length: 36 })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Field(() => String)
  @Column({ type: 'varchar', length: 255 })
  deviceName: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 32 })
  deviceType: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 1024, nullable: true })
  userAgent: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshTokenHash: string | null;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  lastSeenAt: Date | null;

  @Field(() => Date)
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
