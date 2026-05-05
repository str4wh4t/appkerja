import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsArray, IsInt } from 'class-validator';

@InputType()
export class UserAssignRolesInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Field(() => [Int])
  @IsArray()
  @IsInt({ each: true })
  roleIds: number[];
}
