const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Account = require('./Account');

const Student = connection.sequelize.define(
  'student',
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