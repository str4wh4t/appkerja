import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Mhs {
  @Field(() => ID)
  nim!: string;

  @Field(() => String, { nullable: true })
  no_id?: string | null;

  @Field(() => String)
  nama!: string;

  @Field(() => String)
  jenis_kelamin!: string;

  @Field(() => String)
  kode_fakultas!: string;

  @Field(() => String)
  nama_fak_ijazah!: string;

  @Field(() => String)
  kode_prodi!: string;

  @Field(() => String)
  nama_forlap!: string;

  @Field(() => String)
  strata: string;

  @Field(() => String, { nullable: true })
  nama_kabupaten?: string | null;

  @Field(() => String, { nullable: true })
  nama_provinsi?: string | null;

  @Field(() => String, { nullable: true })
  smt_masuk?: string | null;

  @Field(() => String, { nullable: true })
  sso_user_email?: string | null;

  @Field(() => String)
  status_terakhir!: string;

  @Field(() => Int, { nullable: true })
  tahun_masuk?: number | null;

  @Field(() => String, { nullable: true })
  tanggal_lahir?: string | null;

  @Field(() => String, { nullable: true })
  tempat_lahir?: string | null;

  @Field(() => String, { nullable: true })
  agama?: string | null;

  @Field(() => String, { nullable: true })
  alamat?: string | null;

  @Field(() => String, { nullable: true })
  alamat_sekarang?: string | null;

  @Field(() => String, { nullable: true })
  hp?: string | null;
}

@ObjectType()
export class MhsList {
  @Field(() => [Mhs])
  data!: Mhs[];

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
