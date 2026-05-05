import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

/** Same policy as UsersService.assertNewPasswordPolicy (length, digit, symbol). */
const NEW_PASSWORD_POLICY_RE =
  /^(?=.*[0-9])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{8,}$/;

@InputType()
export class AuthChangePasswordInput {
  @Field(() => String)
  @IsNotEmpty()
  currentPassword!: string;

  @Field(() => String)
  @IsNotEmpty()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  @Matches(NEW_PASSWORD_POLICY_RE, {
    message:
      'New password must be at least 8 characters and include at least one number and one symbol',
  })
  newPassword!: string;
}
