import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Min, Max, IsBoolean, IsInt } from 'class-validator';

@InputType()
export class UserRolePaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @Field({
    nullable: true,
    description: 'Search username/email/role name/code',
  })
  @IsOptional()
  search?: string;

  @Field({ nullable: true, defaultValue: 'id' })
  @IsOptional()
  sortBy?: string = 'id';

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  descending?: boolean = true;

  @Field({ nullable: true, description: 'Filter by userId' })
  @IsOptional()
  userId?: string;

  @Field(() => Int, { nullable: true, description: 'Filter by roleId' })
  @IsOptional()
  @IsInt()
  roleId?: number;
}
