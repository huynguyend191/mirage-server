const connection = require('../database/connection');
const Tutor = require('./Tutor');
const Student = require('./Student');
const Sequelize = require('sequelize');

const Preference = connection.sequelize.define('preference', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  type: {
    type: Sequelize.INTEGER
  }
});
Student.belongsToMany(Tutor, { through: { model: Preference, unique: false } });
Tutor.belongsToMany(Student, { through: { model: Preference, unique: false } });
Student.hasMany(Preference);
Preference.belongsTo(Student);
Tutor.hasMany(Preference);
Preference.belongsTo(Tutor);

module.exports = Preference;
