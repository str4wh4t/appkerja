import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('units')
@Index(['code'], { unique: true })
export class Unit {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'char', length: 36, nullable: true })
  @Index()
  parentId: string | null;

  @Field()
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  @Index()
  code: string;

  @Field()
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Field(() => String)
  @Column({ type: 'char', length: 36, nullable: false })
  @Index()
  tenantId: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Field()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

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
  deletedAt: Date | null; // Soft delete
}
