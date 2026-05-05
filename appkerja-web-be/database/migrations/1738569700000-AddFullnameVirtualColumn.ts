import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFullnameVirtualColumn1738569700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if fullname column already exists.
    const fullnameColumnExists = await queryRunner.query(
      `SELECT COUNT(*) as \`count\` FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'users' 
       AND COLUMN_NAME = 'fullname'`,
    );

    if (parseInt(fullnameColumnExists[0].count) === 0) {
      // Create virtual column for fullname
      await queryRunner.query(
        `ALTER TABLE \`users\` ADD COLUMN \`fullname\` VARCHAR(511) AS (CONCAT_WS(' ', \`firstName\`, \`lastName\`)) VIRTUAL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if fullname column exists before dropping.
    const fullnameColumnExists = await queryRunner.query(
      `SELECT COUNT(*) as \`count\` FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'users' 
       AND COLUMN_NAME = 'fullname'`,
    );

    if (parseInt(fullnameColumnExists[0].count) > 0) {
      await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`fullname\``);
    }
  }
}
