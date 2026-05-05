import { InputType, Field } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

@InputType()
export class UsersOwnUpdateProfileInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'First name wajib diisi.' })
  @MinLength(1)
  @MaxLength(255)
  firstName: string;

  @Field(() => String, { nullable: true })
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
}
