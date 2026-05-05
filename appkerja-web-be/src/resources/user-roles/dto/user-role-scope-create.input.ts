import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, IsString, MaxLength } from 'class-validator';

@InputType()
export class UserRoleScopeCreateInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  userRoleId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  scopeType: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  scopeId: string;
}
