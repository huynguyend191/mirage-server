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
    type: Sequelize.INTEGER
  }
});
Student.belongsToMany(Tutor, { through: { model: CallHistory, unique: false } });
Tutor.belongsToMany(Student, { through: { model: CallHistory, unique: false } });

module.exports = CallHistory;