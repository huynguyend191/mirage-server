const Preference = require('../models/Preference');
const Tutor = require('../models/Tutor');
const Account = require('../models/Account');
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const uuid = require('uuid').v4;

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
