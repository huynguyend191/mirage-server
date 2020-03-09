const Sequelize = require('sequelize');
const connection = require('../database/connection');

const Preference = connection.sequelize.define(
  'preferences',
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
    },
    value: {
      type: Sequelize.STRING(200),
    }
  }, {
  indexes: [
    {
      unique: false,
      fields: ['type']
    }
  ]
}
);

module.exports = Preference;