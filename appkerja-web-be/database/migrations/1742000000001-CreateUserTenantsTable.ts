import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateUserTenantsTable1742000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_tenants',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            default: '(UUID())',
          },
          {
            name: 'userId',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'tenantId',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        uniques: [
          {
            columnNames: ['userId', 'tenantId'],
            name: 'UQ_USER_TENANTS_USER_TENANT',
          },
        ],
        engine: 'InnoDB',
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_tenants',
      new TableIndex({
        name: 'IDX_USER_TENANTS_USER_ID',
        columnNames: ['userId'],
      }),
    );
    await queryRunner.createIndex(
      'user_tenants',
      new TableIndex({
        name: 'IDX_USER_TENANTS_TENANT_ID',
        columnNames: ['tenantId'],
      }),
    );

    await queryRunner.createForeignKey(
      'user_tenants',
      new TableForeignKey({
        name: 'FK_USER_TENANTS_USER',
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'user_tenants',
      new TableForeignKey({
        name: 'FK_USER_TENANTS_TENANT',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('user_tenants')) {
      await queryRunner.dropTable('user_tenants');
    }
  }
}
