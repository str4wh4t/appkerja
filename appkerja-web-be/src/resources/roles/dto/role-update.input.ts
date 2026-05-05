import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

@InputType()
export class RoleUpdateInput {
  // @Field({ nullable: true })
  // @IsOptional()
  // @IsString()
  // code?: string;

  // @Field({ nullable: true })
  // @IsOptional()
  // @IsString()
  // name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
