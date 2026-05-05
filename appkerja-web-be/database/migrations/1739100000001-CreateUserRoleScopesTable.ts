import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateUserRoleScopesTable1739100000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_role_scopes',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userRoleId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'scopeType',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'scopeId',
            type: 'varchar',
            length: '100',
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
        engine: 'InnoDB',
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_role_scopes',
      new TableIndex({
        name: 'IDX_USER_ROLE_SCOPES_USER_ROLE_ID',
        columnNames: ['userRoleId'],
      }),
    );

    await queryRunner.createIndex(
      'user_role_scopes',
      new TableIndex({
        name: 'IDX_USER_ROLE_SCOPES_SCOPE',
        columnNames: ['scopeType', 'scopeId'],
      }),
    );

    await queryRunner.createIndex(
      'user_role_scopes',
      new TableIndex({
        name: 'UQ_USER_ROLE_SCOPES_USER_ROLE_TYPE_ID',
        columnNames: ['userRoleId', 'scopeType', 'scopeId'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'user_role_scopes',
      new TableForeignKey({
        columnNames: ['userRoleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user_roles',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'FK_USER_ROLE_SCOPES_USER_ROLE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'user_role_scopes',
      'FK_USER_ROLE_SCOPES_USER_ROLE',
    );
    await queryRunner.dropIndex(
      'user_role_scopes',
      'UQ_USER_ROLE_SCOPES_USER_ROLE_TYPE_ID',
    );
    await queryRunner.dropIndex(
      'user_role_scopes',
      'IDX_USER_ROLE_SCOPES_SCOPE',
    );
    await queryRunner.dropIndex(
      'user_role_scopes',
      'IDX_USER_ROLE_SCOPES_USER_ROLE_ID',
    );
    await queryRunner.dropTable('user_role_scopes');
  }
}
