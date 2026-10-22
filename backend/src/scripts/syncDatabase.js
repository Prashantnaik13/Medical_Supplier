const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { sequelize } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV === 'production') throw new Error('Refusing to sync production schema. Use migrations.');
    await sequelize.sync();
    console.info('Database schema synchronized for development.');
    await sequelize.close();
  } catch (error) {
    console.error('Database sync failed:', error.message);
    process.exitCode = 1;
  }
})();
