import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Min, Max, IsBoolean, IsArray, IsInt } from 'class-validator';

@InputType()
export class UserPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @Field({ nullable: true })
  @IsOptional()
  search?: string;

  @Field({ nullable: true, defaultValue: 'createdAt' })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  descending?: boolean = true;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[];

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  userStatusIds?: number[];

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  withDeleted?: boolean = false;
}
