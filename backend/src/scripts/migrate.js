const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { sequelize } = require('../models');

async function migrate() {
  await sequelize.authenticate();
  await sequelize.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name VARCHAR(190) NOT NULL PRIMARY KEY,
    applied_at DATETIME NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  const [appliedRows] = await sequelize.query('SELECT name FROM schema_migrations');
  const applied = new Set(appliedRows.map((row) => row.name));
  const migrationsDir = path.resolve(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const statements = sql.split(/;\s*(?=\n|$)/).map((statement) => statement.trim()).filter(Boolean);
    console.info(`[migration] applying ${file} (${statements.length} statements)`);
    for (const statement of statements) await sequelize.query(statement);
    await sequelize.query('INSERT INTO schema_migrations (name, applied_at) VALUES (?, NOW())', { replacements: [file] });
    console.info(`[migration] applied ${file}`);
  }
}

migrate().then(() => sequelize.close()).catch(async (error) => {
  console.error('[migration:error]', error);
  await sequelize.close().catch(() => {});
  process.exitCode = 1;
});
