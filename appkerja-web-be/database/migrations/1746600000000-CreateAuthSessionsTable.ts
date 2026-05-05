import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateAuthSessionsTable1746600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'auth_sessions',
        columns: [
          { name: 'id', type: 'char', length: '36', isPrimary: true },
          { name: 'userId', type: 'char', length: '36', isNullable: false },
          { name: 'deviceName', type: 'varchar', length: '255', isNullable: false },
          { name: 'deviceType', type: 'varchar', length: '32', isNullable: false },
          { name: 'userAgent', type: 'varchar', length: '1024', isNullable: true },
          { name: 'ipAddress', type: 'varchar', length: '64', isNullable: true },
          {
            name: 'refreshTokenHash',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'lastSeenAt', type: 'timestamp', isNullable: true },
          { name: 'expiresAt', type: 'timestamp', isNullable: false },
          { name: 'revokedAt', type: 'timestamp', isNullable: true },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        engine: 'InnoDB',
      }),
      true,
    );

    await queryRunner.createIndex(
      'auth_sessions',
      new TableIndex({
        name: 'IDX_AUTH_SESSIONS_USER_ID',
        columnNames: ['userId'],
      }),
    );
    await queryRunner.createIndex(
      'auth_sessions',
      new TableIndex({
        name: 'IDX_AUTH_SESSIONS_EXPIRES_AT',
        columnNames: ['expiresAt'],
      }),
    );
    await queryRunner.createIndex(
      'auth_sessions',
      new TableIndex({
        name: 'IDX_AUTH_SESSIONS_REVOKED_AT',
        columnNames: ['revokedAt'],
      }),
    );

    await queryRunner.createForeignKey(
      'auth_sessions',
      new TableForeignKey({
        name: 'FK_AUTH_SESSIONS_USERS',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('auth_sessions', 'FK_AUTH_SESSIONS_USERS');
    await queryRunner.dropIndex('auth_sessions', 'IDX_AUTH_SESSIONS_REVOKED_AT');
    await queryRunner.dropIndex('auth_sessions', 'IDX_AUTH_SESSIONS_EXPIRES_AT');
    await queryRunner.dropIndex('auth_sessions', 'IDX_AUTH_SESSIONS_USER_ID');
    await queryRunner.dropTable('auth_sessions');
  }
}
