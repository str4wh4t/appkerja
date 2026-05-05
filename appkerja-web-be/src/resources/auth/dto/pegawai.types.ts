import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Pegawai {
  @Field(() => String, { nullable: true })
  foto?: string | null;

  @Field(() => String, { nullable: true })
  glr_blkg?: string | null;

  @Field(() => String, { nullable: true })
  glr_dpn?: string | null;

  @Field(() => String, { nullable: true })
  gol_text?: string | null;

  @Field(() => Int)
  id!: number;

  @Field(() => String, { nullable: true })
  jabatan_text?: string | null;

  @Field(() => String)
  jenis_pegawai!: string;

  @Field(() => Int)
  jnspeg!: number;

  @Field(() => String, { nullable: true })
  nama?: string | null;

  @Field(() => String, { nullable: true })
  nidk?: string | null;

  @Field(() => String, { nullable: true })
  nidn?: string | null;

  @Field(() => String, { nullable: true })
  nik?: string | null;

  @Field(() => ID)
  nip!: string;

  @Field(() => String, { nullable: true })
  npwp?: string | null;

  @Field(() => String, { nullable: true })
  nuptk?: string | null;

  @Field(() => String, { nullable: true })
  pangkat_text?: string | null;

  @Field(() => String, { nullable: true })
  sso_user_email?: string | null;

  @Field(() => String, { nullable: true })
  kode_fakultas?: string | null;

  @Field(() => String)
  nama_fak_ijazah!: string;
}

@ObjectType()
export class PegawaiList {
  @Field(() => [Pegawai])
  data!: Pegawai[];

  @Field(() => Int)
  total!: number;

  @Field(() => Boolean)
  hasNextPage!: boolean;

  @Field(() => Boolean)
  hasPreviousPage!: boolean;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  totalPages!: number;

  @Field(() => Int)
  take!: number;
}
