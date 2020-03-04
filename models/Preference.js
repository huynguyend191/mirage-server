const Sequelize = require('sequelize');
const connection = require('../database/connection');

const Preference = connection.sequelize.define(
  'preference',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    type: {
      type: Sequelize.STRING(50),
    },
    key: {
      type: Sequelize.STRING(10),
      unique: true,
    },
    value: {
      type: Sequelize.STRING(200),
      unique: true
    }
  }
);

module.exports = Preference;