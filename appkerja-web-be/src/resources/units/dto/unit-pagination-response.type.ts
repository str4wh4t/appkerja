import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Unit } from '../entities/unit.entity.js';

@ObjectType()
export class UnitPaginationResponse {
  @Field(() => [Unit])
  data: Unit[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}
