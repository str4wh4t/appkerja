import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity.js';

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;

  @Field()
  token_type: string;

  @Field()
  expires_in: string;

  @Field(() => User)
  user: User;

  @Field(() => String, {
    nullable: true,
    description:
      'Sama dengan claim activeRoleCode di access token (konteks UI). Null jika tidak dipilih.',
  })
  activeRoleCode?: string | null;

  @Field(() => String, {
    nullable: true,
    description:
      'Sama dengan claim activeTenantId di access token (konteks tenancy).',
  })
  activeTenantId?: string | null;
}
