import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsBoolean,
  IsInt,
  IsString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

@InputType()
export class MhsWhereInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  descending?: boolean;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  kode_fakultas_list?: number[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  strata_list?: string[];

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

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  status_terakhir_list?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  take?: number;
}
