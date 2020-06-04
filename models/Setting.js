const connection = require('../database/connection');

const Sequelize = require('sequelize');

const Setting = connection.sequelize.define('setting', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  type: {
    type: Sequelize.STRING
  },
  content: {
    type: Sequelize.TEXT
  }
});

module.exports = Setting;
