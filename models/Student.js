const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Account = require('./Account');

const Student = connection.sequelize.define(
  'students',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(100)
    },
    phone: {
      type: Sequelize.STRING(50)
    },
    birthdate: {
      type: Sequelize.DATE
    },
    avatar: {
      type: Sequelize.TEXT
    },
    student_lvl: {
      type: Sequelize.STRING(40)
    },
    student_type: {
      type: Sequelize.STRING(40)
    },
    teaching_styles: {
      type: Sequelize.TEXT
    },
    accent: {
      type: Sequelize.STRING(40)
    },
    specialities: {
      type: Sequelize.TEXT
    },
    remaining_time: {
      type: Sequelize.INTEGER //milliseconds
    }
  }, {
    indexes: [
      {
        unique: false,
        fields: ['name']
      }
    ]
  }
);

Student.belongsTo(Account);

module.exports = Student;