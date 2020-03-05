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
    email: {
      type: Sequelize.STRING(255),
      unique: true,
    },
    password: {
      type: Sequelize.TEXT
    },
    role: {
      type: Sequelize.INTEGER
    }
  }, {
  indexes: [
    {
      unique: true,
      fields: ['username']
    },
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: false,
      fields: ['role']
    }
  ]
}
);



module.exports = Account;