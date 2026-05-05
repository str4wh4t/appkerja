import { InputType, Field, PartialType } from '@nestjs/graphql';
import { UserCreateInput } from './user-create.input.js';
import { Allow, IsOptional } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class UserUpdateInput extends PartialType(UserCreateInput) {
  @Field(() => GraphQLUpload, {
    nullable: true,
    description: 'Gambar avatar (JPEG atau PNG).',
  })
  @Allow()
  @IsOptional()
  avatar?: Promise<FileUpload>;
}
