const CallHistory = require('../models/CallHistory');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const Op = require('sequelize').Op;
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid').v4;

exports.createDirCallHistories = (req, res, next) => {
  const callId = uuid();
  req.callId = callId;
  const dir = path.resolve(`uploads/callHistories/${callId}`);
  fs.mkdirSync(dir, { recursive: true });
  next();
}

const callHistoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./uploads/callHistories/${req.callId}`);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

exports.uploadCallVideos = multer({ storage: callHistoryStorage }).array('videos', 2);

exports.createCallHistory = async (req, res) => {
  try {
    await CallHistory.create({
      id: req.callId,
      tutorId: req.body.tutorId,
      studentId: req.body.studentId,
      duration: req.body.duration,
      studentVideo: `/uploads/callHistories/${req.callId}/student.wemb`,
      tutorVideo: `/uploads/callHistories/${req.callId}/tutor.wemb`
    });
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS
    })
  } catch (error) {
    console.log(error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_CREATE
    })
  }
}