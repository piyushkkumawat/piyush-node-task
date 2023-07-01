const dbConfig = require('./config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
   
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    }
  });
 const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/*========
 Common config model
=========*/ 
db.registration= require('../modal/user.modal')(sequelize,Sequelize);

module.exports = db;