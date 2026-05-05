import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType({
  description:
    'Role code yang dipilih untuk konteks UI (menu). Harus salah satu dari user.roles[].code. Tidak mengubah union permission.',
})
export class AuthSetActiveRoleInput {
  @Field({
    description: 'Kode role yang dimiliki user, mis. operator, admin, mhs.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  activeRoleCode: string;
}
