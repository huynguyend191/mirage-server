const Sequelize = require('sequelize');
const connection = require('../database/connection');
const CallHistory = require('./CallHistory');
const Account = require('./Account');

const Report = connection.sequelize.define('reports', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  reason: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.TEXT
  },
  state: {
    type: Sequelize.INTEGER
  }
});

Report.belongsTo(CallHistory);
Report.belongsTo(Account);

module.exports = Report;
