import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthSessionType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  deviceName: string;

  @Field(() => String)
  deviceType: string;

  @Field(() => String, { nullable: true })
  ipAddress?: string | null;

  @Field(() => String, { nullable: true })
  userAgent?: string | null;

  @Field(() => Date, { nullable: true })
  lastSeenAt?: Date | null;

  @Field(() => Date)
  expiresAt: Date;

  @Field(() => Boolean)
  isCurrent: boolean;
}
