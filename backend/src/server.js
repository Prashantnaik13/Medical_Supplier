const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const { sequelize } = require('./models');

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
    throw new Error('Set JWT_SECRET to a random value with at least 24 characters in backend/.env.');
  }
  await sequelize.authenticate();
  console.info('[db] MySQL connection ready.');
  if (String(process.env.DB_AUTO_SYNC).toLowerCase() === 'true') {
    if (process.env.NODE_ENV === 'production') throw new Error('DB_AUTO_SYNC must be disabled in production; apply versioned migrations instead.');
    await sequelize.sync();
    console.info('[db] Development schema sync complete.');
  }
  if (String(process.env.SEED_DEMO).toLowerCase() === 'true') {
    const { seedDemo } = require('./seeders/seed');
    await seedDemo();
  }
  const port = Number(process.env.PORT || 4000);
  const server = app.listen(port, '0.0.0.0', () => console.info(`[api] Medora API listening on 0.0.0.0:${port}`));
  const shutdown = async (signal) => {
    console.info(`[api] ${signal} received; shutting down gracefully.`);
    server.close(async () => { await sequelize.close(); process.exit(0); });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  return server;
}

start().catch((error) => {
  console.error('[startup:error]', error);
  process.exit(1);
});
