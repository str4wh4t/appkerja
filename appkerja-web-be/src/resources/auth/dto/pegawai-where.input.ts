import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsBoolean,
  IsInt,
  IsString,
  IsArray,
} from 'class-validator';

@InputType()
export class PegawaiWhereInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  descending?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  skip?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  page?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  status_list?: number[];

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  unit_id_list?: number[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  take?: number;
}
