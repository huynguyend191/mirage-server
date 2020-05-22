const CallHistory = require('../models/CallHistory');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const Account = require('../models/Account');
const Op = require('sequelize').Op;
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const uuid = require('uuid').v4;
const streamVideoFromPath = require('../lib/utils/streamVideoFromPath');

exports.getCallHistories = async (req, res) => {
  try {
    const callHistories = await CallHistory.findAll({
      order: [
        ['createdAt', 'DESC']
      ],
      include: [
        { 
          model: Student, 
          include: [{
            model: Account,
            attributes: ['id', 'username']
          }],
          attributes: ['id', 'name']
        },
        { 
          model: Tutor, 
          include: [{
            model: Account,
            attributes: ['id', 'username']
          }],
          attributes: ['id', 'name']
        }
      ]
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
}

exports.getTutorRecord = async (req, res) => {
  const videoPath = `uploads/callHistories/${req.params.id}/tutor.webm`;
  streamVideoFromPath(req, res, videoPath);
}

exports.getStudenRecord = async (req, res) => {
  const videoPath =  `uploads/callHistories/${req.params.id}/student.webm`;
  streamVideoFromPath(req, res, videoPath);
}