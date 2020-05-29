const CallHistory = require('../models/CallHistory');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const Account = require('../models/Account');
const Op = require('sequelize').Op;
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const streamVideoFromPath = require('../lib/utils/streamVideoFromPath');
const roles = require('../lib/constants/account').ROLES;

exports.getCallHistories = async (req, res) => {
  let searchQuery = {};
  if (req.query.search && req.query.search != '') {
    searchQuery = {
      [Op.or]: [
        { '$tutor.name$': { [Op.like]: `%${req.query.search}%` } },
        { '$tutor.account.username$': { [Op.like]: `%${req.query.search}%` } },
        { '$student.name$': { [Op.like]: `%${req.query.search}%` } },
        { '$student.account.username$': { [Op.like]: `%${req.query.search}%` } }
      ]
    };
  }
  if (req.query.tutorId) {
    if (req.role != roles.ADMIN && req.query.tutorId !== req.user.tutor.id) {
      return res.status(httpStatus.FORBIDDEN).json({
        message: msg.MSG_FORBIDDEN
      });
    }
    searchQuery.tutorId = req.query.tutorId;
  }
  if (req.query.studentId) {
    if (req.role != roles.ADMIN && req.query.studentId !== req.user.student.id) {
      return res.status(httpStatus.FORBIDDEN).json({
        message: msg.MSG_FORBIDDEN
      });
    }
    searchQuery.studentId = req.query.studentId;
  }
  try {
    const callHistories = await CallHistory.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Student,
          include: [
            {
              model: Account,
              attributes: ['id', 'username']
            }
          ],
          attributes: ['id', 'name']
        },
        {
          model: Tutor,
          include: [
            {
              model: Account,
              attributes: ['id', 'username']
            }
          ],
          attributes: ['id', 'name']
        }
      ],
      where: searchQuery
    });
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
      callHistories: callHistories
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
};

exports.getTutorRecord = async (req, res) => {
  const videoPath = `uploads/callHistories/${req.params.id}/tutor.webm`;
  streamVideoFromPath(req, res, videoPath);
};

exports.getStudenRecord = async (req, res) => {
  const videoPath = `uploads/callHistories/${req.params.id}/student.webm`;
  streamVideoFromPath(req, res, videoPath);
};
