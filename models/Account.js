const Sequelize = require('sequelize');
const connection = require('../database/connection');

const Account = connection.sequelize.define(
  'accounts',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING(36),
    },
    email: {
      type: Sequelize.STRING(255),
    },
    password: {
      type: Sequelize.TEXT
    },
    role: {
      type: Sequelize.INTEGER
    },
    state: {
      type: Sequelize.BOOLEAN
    },
    verification: {
      type: Sequelize.BOOLEAN
    },
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
    },
    {
      unique: false,
      fields: ['state', 'verification']
    }
  ]
}
);

module.exports = Account;