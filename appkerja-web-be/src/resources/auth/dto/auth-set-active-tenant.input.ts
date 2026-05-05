import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@InputType({
  description:
    'Tenant aktif untuk konteks data tenancy. Harus tenant yang bisa diakses user.',
})
export class AuthSetActiveTenantInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  @Length(36, 36)
  activeTenantId: string;
}
