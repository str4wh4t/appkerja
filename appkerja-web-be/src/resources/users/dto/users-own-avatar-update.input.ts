import { InputType, Field } from '@nestjs/graphql';
import { Allow, IsOptional } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class UsersOwnAvatarUpdateInput {
  @Field(() => GraphQLUpload, { description: 'Gambar avatar (JPEG atau PNG).' })
  @Allow()
  fileUpload!: Promise<FileUpload>;

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description:
      'Jika true, unggah ke bucket publik (S3_PUBLIC_BUCKET). Default false (bucket privat).',
  })
  @IsOptional()
  isPublicUpload?: boolean;
}
