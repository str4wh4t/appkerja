import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, IsString, MaxLength } from 'class-validator';

@InputType()
export class UserRoleScopeUpdateInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  userRoleId?: number;

  @Field({
    nullable: true,
    description: 'Nama entity yang dijadikan scope (contoh: units).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  scopeType?: string;

  @Field({
    nullable: true,
    description: 'ID dari entity sesuai scopeType.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  scopeId?: string;
}
