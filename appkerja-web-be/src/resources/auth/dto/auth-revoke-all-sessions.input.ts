import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class AuthRevokeAllSessionsInput {
  @Field(() => Boolean, {
    nullable: true,
    defaultValue: true,
    description: 'Jika true, session saat ini dipertahankan.',
  })
  @IsOptional()
  @IsBoolean()
  keepCurrentSession?: boolean;
}
