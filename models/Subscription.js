const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Student = require('./Student');

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
    },
    price: {
      type: Sequelize.FLOAT 
    },
    tier: {
      type: Sequelize.INTEGER
    }
  },
);

Subscription.belongsTo(Student);

module.exports = Subscription;