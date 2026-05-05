import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RefreshTokenResponse {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;

  @Field()
  token_type: string;

  @Field()
  expires_in: string;

  @Field(() => String, {
    nullable: true,
    description: 'Dipertahankan dari refresh token sebelumnya (konteks UI).',
  })
  activeRoleCode?: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'Dipertahankan dari refresh token sebelumnya (konteks tenancy).',
  })
  activeTenantId?: string | null;
}
