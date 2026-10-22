const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'medora',
  process.env.DB_USER || 'medora',
  process.env.DB_PASSWORD || 'medora-local',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: String(process.env.DB_LOGGING).toLowerCase() === 'true' ? console.log : false,
    timezone: '+05:30',
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      dateStrings: true,
      typeCast: true,
    },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: { underscored: true, freezeTableName: true },
  },
);

module.exports = sequelize;
