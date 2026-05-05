import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, IsArray } from 'class-validator';

@InputType()
export class RoleAssignPermissionsInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  roleId: number;

  @Field(() => [Int])
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}
