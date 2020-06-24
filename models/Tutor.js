const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Account = require('./Account');

const Tutor = connection.sequelize.define(
  'tutors',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(100)
    },
    profileStatus: {
      type: Sequelize.INTEGER
    },
    phone: {
      type: Sequelize.STRING(50)
    },
    birthdate: {
      type: Sequelize.DATE
    },
    address: {
      type: Sequelize.TEXT
    },
    avatar: {
      type: Sequelize.TEXT
    },
    interests: {
      type: Sequelize.TEXT
    },
    education: {
      type: Sequelize.TEXT
    },
    experience: {
      type: Sequelize.TEXT
    },
    profession: {
      type: Sequelize.TEXT
    },
    certificates: {
      type: Sequelize.TEXT
    },
    introduction: {
      type: Sequelize.TEXT
    },
    reason: {
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
    fluency: {
      type: Sequelize.STRING(40)
    },
    specialities: {
      type: Sequelize.TEXT
    }
  },
  {
    indexes: [
      {
        unique: false,
        fields: ['name']
      },
      {
        unique: false,
        fields: ['profileStatus']
      }
    ]
  }
);

Tutor.belongsTo(Account);

module.exports = Tutor;
