import {
  MigrationInterface,
  QueryRunner,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddTenantColumnsToDomainTables1742000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.addTenantColumnAndForeignKey(queryRunner, 'units', 'FK_UNITS_TENANT');
    await this.addTenantColumnAndForeignKey(
      queryRunner,
      'role_permissions',
      'FK_ROLE_PERMISSIONS_TENANT',
      true,
    );
    await this.addTenantColumnAndForeignKey(
      queryRunner,
      'user_roles',
      'FK_USER_ROLES_TENANT',
      true,
    );
    await this.addTenantColumnAndForeignKey(
      queryRunner,
      'user_role_scopes',
      'FK_USER_ROLE_SCOPES_TENANT',
    );

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropTenantForeignAndColumn(
      queryRunner,
      'user_role_scopes',
      'FK_USER_ROLE_SCOPES_TENANT',
    );
    await this.dropTenantForeignAndColumn(
      queryRunner,
      'user_roles',
      'FK_USER_ROLES_TENANT',
    );
    await this.dropTenantForeignAndColumn(queryRunner, 'units', 'FK_UNITS_TENANT');
    await this.dropTenantForeignAndColumn(
      queryRunner,
      'role_permissions',
      'FK_ROLE_PERMISSIONS_TENANT',
    );
  }

  private async addTenantColumnAndForeignKey(
    queryRunner: QueryRunner,
    tableName: string,
    foreignKeyName: string,
    keepNullable: boolean = false,
  ): Promise<void> {
    const hasTable = await queryRunner.hasTable(tableName);
    if (!hasTable) {
      return;
    }
    const hasTenantColumn = await queryRunner.hasColumn(tableName, 'tenantId');
    if (!hasTenantColumn) {
      await queryRunner.query(
        `ALTER TABLE \`${tableName}\` ADD COLUMN \`tenantId\` CHAR(36) NULL`,
      );
    }

    await queryRunner.query(
      `UPDATE \`${tableName}\`
       SET \`tenantId\` = (SELECT id FROM tenants WHERE code = 'default' LIMIT 1)
       WHERE \`tenantId\` IS NULL`,
    );

    if (!keepNullable) {
      await queryRunner.query(
        `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`tenantId\` CHAR(36) NOT NULL`,
      );
    }

    const indexName = `IDX_${tableName.toUpperCase()}_TENANT_ID`;
    const table = await queryRunner.getTable(tableName);
    const hasIndex = table?.indices.some((idx) => idx.name === indexName);
    if (!hasIndex) {
      await queryRunner.createIndex(
        tableName,
        new TableIndex({
          name: indexName,
          columnNames: ['tenantId'],
        }),
      );
    }

    const refreshed = await queryRunner.getTable(tableName);
    const hasFk = refreshed?.foreignKeys.some((fk) => fk.name === foreignKeyName);
    if (!hasFk) {
      await queryRunner.createForeignKey(
        tableName,
        new TableForeignKey({
          name: foreignKeyName,
          columnNames: ['tenantId'],
          referencedTableName: 'tenants',
          referencedColumnNames: ['id'],
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        }),
      );
    }
  }

  private async dropTenantForeignAndColumn(
    queryRunner: QueryRunner,
    tableName: string,
    foreignKeyName: string,
  ): Promise<void> {
    const hasTable = await queryRunner.hasTable(tableName);
    if (!hasTable) {
      return;
    }
    const table = await queryRunner.getTable(tableName);
    const fk = table?.foreignKeys.find((x) => x.name === foreignKeyName);
    if (fk) {
      await queryRunner.dropForeignKey(tableName, fk);
    }
    const idx = table?.indices.find((x) => x.columnNames.includes('tenantId'));
    if (idx) {
      await queryRunner.dropIndex(tableName, idx);
    }
    if (await queryRunner.hasColumn(tableName, 'tenantId')) {
      await queryRunner.dropColumn(tableName, 'tenantId');
    }
  }
}
