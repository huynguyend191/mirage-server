const connection = require('../database/connection');
const Tutor = require('./Tutor');
const Student = require('./Student');
const Sequelize = require('sequelize');

const Review = connection.sequelize.define('review', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  comment: {
    type: Sequelize.STRING
  },
  rating: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
});
Student.belongsToMany(Tutor, { through: { model: CallHistory, unique: false } });
Tutor.belongsToMany(Student, { through: { model: CallHistory, unique: false } });

module.exports = Review;