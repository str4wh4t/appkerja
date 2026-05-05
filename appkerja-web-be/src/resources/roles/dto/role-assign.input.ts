import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsInt } from 'class-validator';

@InputType()
export class RoleAssignInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  roleId: number;
}
