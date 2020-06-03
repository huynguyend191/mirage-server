const Preference = require('../models/Preference');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const Account = require('../models/Account');
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const uuid = require('uuid').v4;
const { PREFERENCE_TYPE, PROFILE_STATUS } = require('../lib/constants/account');

exports.createPreference = async (req, res) => {
  try {
    const preference = await Preference.findOne({
      where: {
        studentId: req.body.studentId,
        tutorId: req.body.tutorId
      }
    });
    if (!preference) {
      await Preference.create({
        id: uuid(),
        studentId: req.body.studentId,
        tutorId: req.body.tutorId,
        type: req.body.type
      });
    }
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    let search = {};
    if (req.query.studentId) {
      search.studentId = req.query.studentId;
    }
    if (req.query.tutorId) {
      search.tutorId = req.query.tutorId;
    }
    const preferences = await Preference.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Tutor,
          include: [
            {
              model: Account,
              attributes: ['id', 'username']
            }
          ]
        }
      ],
      where: search
    });

    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
      preferences: preferences
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
};

exports.deletePreference = async (req, res) => {
  try {
    const preference = await Preference.findOne({
      where: { id: req.params.id }
    });
    if (preference) {
      await Preference.destroy({
        where: { id: preference.id }
      });
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS
      });
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_DELETE
    });
  }
};

exports.createRecommend = async () => {
  try {
    const tutors = await Tutor.findAll({
      where: {
        profileStatus: PROFILE_STATUS.ACCEPTED
      }
    });
    const students = await Student.findAll();
    students.forEach(async student => {
      const recommends = [];
      tutors.forEach(tutor => {
        let tutorPoint = 0;
        if (student.dataValues.student_lvl === tutor.dataValues.student_lvl) {
          tutorPoint++;
        }
        if (student.dataValues.student_type === tutor.dataValues.student_type) {
          tutorPoint++;
        }
        if (student.dataValues.accent === tutor.dataValues.accent) {
          tutorPoint++;
        }
        if (tutor.dataValues.certificates && JSON.parse(tutor.dataValues.certificates).length > 0) {
          tutorPoint++;
        }
        if (tutor.dataValues.teaching_styles && JSON.parse(tutor.dataValues.teaching_styles).length > 0) {
          if (student.dataValues.teaching_styles && JSON.parse(student.dataValues.teaching_styles).length > 0) {
            JSON.parse(student.dataValues.teaching_styles).forEach(style => {
              if (JSON.parse(tutor.dataValues.teaching_styles).includes(style)) {
                tutorPoint++;
              }
            });
          }
        }
        if (tutor.dataValues.specialities && JSON.parse(tutor.dataValues.specialities).length > 0) {
          if (student.dataValues.specialities && JSON.parse(student.dataValues.specialities).length > 0) {
            JSON.parse(student.dataValues.specialities).forEach(spec => {
              if (JSON.parse(tutor.dataValues.specialities).includes(spec)) {
                tutorPoint++;
              }
            });
          }
        }
        recommends.push({
          tutorId: tutor.dataValues.id,
          studentId: student.dataValues.id,
          point: tutorPoint
        });
      });
      recommends.sort((a, b) => (a.point < b.point ? 1 : -1));
      if (recommends.length > 0) {
        const preference = await Preference.findOne({
          where: {
            tutorId: recommends[0].tutorId,
            studentId: recommends[0].studentId,
            type: PREFERENCE_TYPE.RECOMMEND
          }
        });
        if (!preference) {
          await Preference.create({
            id: uuid(),
            tutorId: recommends[0].tutorId,
            studentId: recommends[0].studentId,
            type: PREFERENCE_TYPE.RECOMMEND
          });
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};
