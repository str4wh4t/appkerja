import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class AuthRevokeSessionInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  sessionId: string;
}
