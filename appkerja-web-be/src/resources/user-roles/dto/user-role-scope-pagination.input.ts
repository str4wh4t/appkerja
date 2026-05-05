import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Min, Max, IsBoolean } from 'class-validator';

@InputType()
export class UserRoleScopePaginationInput {
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
    description: 'Search by fullname user and role name',
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
}
