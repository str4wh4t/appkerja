import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserRoleScope } from '../entities/user-role-scope.entity.js';

@ObjectType()
export class UserRoleScopePaginationResponse {
  @Field(() => [UserRoleScope])
  data: UserRoleScope[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}
