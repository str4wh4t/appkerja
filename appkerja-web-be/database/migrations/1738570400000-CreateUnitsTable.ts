import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUnitsTable1738570400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'units',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'parentId',
            type: 'char',
            length: '36',
            isNullable: true,
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
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        engine: 'InnoDB',
      }),
      true,
    );

    // Create unique index for code
    await queryRunner.createIndex(
      'units',
      new TableIndex({
        name: 'IDX_UNITS_CODE',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    // Create index for parentId
    await queryRunner.createIndex(
      'units',
      new TableIndex({
        name: 'IDX_UNITS_PARENT_ID',
        columnNames: ['parentId'],
      }),
    );

    // Create foreign key constraint untuk self-referencing relationship
    await queryRunner.createForeignKey(
      'units',
      new TableForeignKey({
        columnNames: ['parentId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'units',
        onDelete: 'SET NULL', // Jika parent dihapus, set parentId menjadi NULL
        onUpdate: 'CASCADE', // Jika parent id berubah, update parentId
        name: 'FK_UNITS_PARENT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey('units', 'FK_UNITS_PARENT');

    // Drop indexes
    await queryRunner.dropIndex('units', 'IDX_UNITS_PARENT_ID');
    await queryRunner.dropIndex('units', 'IDX_UNITS_CODE');

    // Drop table
    await queryRunner.dropTable('units');
  }
}
