import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUserStatusesTable1738569500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_statuses',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
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
        engine: 'InnoDB',
      }),
      true,
    );

    // Create unique index for code
    await queryRunner.createIndex(
      'user_statuses',
      new TableIndex({
        name: 'IDX_USER_STATUSES_CODE',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    // Note: Data seeding is handled by seeder (database/seeders/user-statuses.seeder.ts)
    // Run: npm run seed:user-statuses
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('user_statuses', 'IDX_USER_STATUSES_CODE');

    // Drop table
    await queryRunner.dropTable('user_statuses');
  }
}
