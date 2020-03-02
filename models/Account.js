const Sequelize = require('sequelize');
const connection = require('../database/connection');

const Account = connection.sequelize.define(
  'account',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING(36),
      unique: true,
    },
    password: {
      type: Sequelize.TEXT
    },
    role: {
      type: Sequelize.INTEGER
    }
  }
);

module.exports = Account;