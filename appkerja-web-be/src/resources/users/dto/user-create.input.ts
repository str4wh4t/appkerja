import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

@InputType()
export class UserCreateInput {
  @Field()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'First name wajib diisi.' })
  @MinLength(1)
  @MaxLength(255)
  firstName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Phone wajib diisi.' })
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^\+?[0-9][0-9\s-]{7,19}$/, {
    message: 'Nomor telepon tidak valid.',
  })
  phone: string;

  @Field({ nullable: true, defaultValue: 1 })
  @IsOptional()
  statusId?: number;

  @Field(() => [Number], { nullable: true })
  @IsOptional()
  roleIds?: number[];
}
