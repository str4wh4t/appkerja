import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserRole } from '../entities/user-role.entity.js';

@ObjectType()
export class UserRolePaginationResponse {
  @Field(() => [UserRole])
  data: UserRole[];

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
