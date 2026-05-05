import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class PermissionUpdateInput {
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

  // @Field({ nullable: true })
  // @IsOptional()
  // @IsString()
  // resource?: string;

  // @Field({ nullable: true })
  // @IsOptional()
  // @IsString()
  // action?: string;
}
