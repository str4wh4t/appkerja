import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class AuthCompleteSsoOnboardingInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'First name wajib diisi.' })
  @MinLength(1)
  @MaxLength(255)
  firstName: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lastName?: string | null;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'Username hanya boleh huruf, angka, titik, garis bawah, dan tanda hubung.',
  })
  username: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^\+?[0-9][0-9\s-]{7,19}$/, {
    message: 'Nomor telepon tidak valid.',
  })
  phone: string;
}
