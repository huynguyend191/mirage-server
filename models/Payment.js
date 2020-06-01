const Sequelize = require('sequelize');
const connection = require('../database/connection');
const CallHistory = require('./CallHistory');
const Tutor = require('./Tutor');

const Payment = connection.sequelize.define('payment', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  state: {
    type: Sequelize.INTEGER
  },
  price: {
    type: Sequelize.FLOAT
  }
});

Tutor.hasMany(Payment);
Payment.belongsTo(Tutor);
Payment.hasMany(CallHistory);

module.exports = Payment;
