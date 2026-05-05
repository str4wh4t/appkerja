import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class AuthRefreshTokenInput {
  @Field()
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString()
  refresh_token: string;
}
