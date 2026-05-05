import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

@InputType()
export class AuthLoginInput {
  @Field()
  @IsNotEmpty({ message: 'Username or email is required' })
  @IsString()
  usernameOrEmail: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
