const Sequelize = require('sequelize');
const connection = require('../database/connection');

const UnverifiedAccount = connection.sequelize.define(
  'unverified_account',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING(255),
      unique: true
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ],
  timestamps: false
});

module.exports = UnverifiedAccount;