const connection = require('../database/connection');
const Tutor = require('./Tutor');
const Student = require('./Student');
const Sequelize = require('sequelize');

const Review = connection.sequelize.define('reviews', {
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
Student.belongsToMany(Tutor, { through: { model: Review, unique: false } });
Tutor.belongsToMany(Student, { through: { model: Review, unique: false } });
Student.hasMany(Review);
Review.belongsTo(Student);
Tutor.hasMany(Review);
Review.belongsTo(Tutor);

module.exports = Review;
