const Sequelize = require('sequelize');
const connection = require('../database/connection');

const Subscription = connection.sequelize.define(
  'subscriptions',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    duration: {
      type: Sequelize.INTEGER, //milliseconds
    },
    state: {
      type: Sequelize.INTEGER
    }
  },
);

module.exports = Subscription;