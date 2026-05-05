import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class TenantDeleteInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
