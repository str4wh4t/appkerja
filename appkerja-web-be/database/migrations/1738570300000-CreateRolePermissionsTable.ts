import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateRolePermissionsTable1738570300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'roleId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'permissionId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        engine: 'InnoDB',
      }),
      true,
    );

    // Create composite unique index
    await queryRunner.createIndex(
      'role_permissions',
      new TableIndex({
        name: 'IDX_ROLE_PERMISSIONS_UNIQUE',
        columnNames: ['roleId', 'permissionId'],
        isUnique: true,
      }),
    );

    // Create foreign key to roles
    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create foreign key to permissions
    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['permissionId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permissions',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get table to find foreign keys
    const table = await queryRunner.getTable('role_permissions');
    
    // Drop foreign keys
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('role_permissions', fk);
      }
    }

    // Drop indexes
    await queryRunner.dropIndex('role_permissions', 'IDX_ROLE_PERMISSIONS_UNIQUE');

    // Drop table
    await queryRunner.dropTable('role_permissions');
  }
}
