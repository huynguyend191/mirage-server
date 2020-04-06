const connection = require('../database/connection');
const Tutor = require('./Tutor');
const Student = require('./Student');
const Sequelize = require('sequelize');

const CallHistory = connection.sequelize.define('call_history', {
  duration: {
    type: Sequelize.INTEGER
  }
});
Student.belongsToMany(Tutor, { through: CallHistory });
Tutor.belongsToMany(Student, { through: CallHistory });

module.exports = CallHistory;