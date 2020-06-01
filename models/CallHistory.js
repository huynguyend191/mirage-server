const connection = require('../database/connection');
const Tutor = require('./Tutor');
const Student = require('./Student');
const Sequelize = require('sequelize');

const CallHistory = connection.sequelize.define('call_history', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  duration: {
    type: Sequelize.INTEGER //milliseconds
  },
  counted: {
    type: Sequelize.BOOLEAN
  }
});
Student.belongsToMany(Tutor, { through: { model: CallHistory, unique: false } });
Tutor.belongsToMany(Student, { through: { model: CallHistory, unique: false } });
Student.hasMany(CallHistory);
CallHistory.belongsTo(Student);
Tutor.hasMany(CallHistory);
CallHistory.belongsTo(Tutor);

module.exports = CallHistory;
