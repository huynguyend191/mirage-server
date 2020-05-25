const Report = require('../models/Report');
const CallHistory = require('../models/CallHistory');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const Account = require('../models/Account');
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const { validateIntNumber, validateString } = require('../lib/utils/validateData');
const uuid = require('uuid').v4;
const connection = require('../database/connection');
const { REPORT_STATE, STATES } = require('../lib/constants/account');


exports.createReport = async (req, res) => {
  if (!validateString(req.body.reason)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: msg.MSG_FAIL_TO_CREATE,
    });
  }
  try {
    await Report.create({
      id: uuid(),
      reason: req.body.reason,
      description: req.body.description,
      accountId: req.body.accountId,
      callHistoryId: req.body.callId,
      state: REPORT_STATE.PENDING
    });
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
}

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      order: [
        ['createdAt', 'DESC']
      ],
      include: [
        { 
          model: CallHistory,
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
        },
        {
          model: Account,
          attributes: ['id', 'username']
        }
      ]
    });
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
      reports: reports
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
}

exports.updateReport = async (req, res) => {
  if (!validateIntNumber(req.body.state)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: msg.MSG_FAIL_TO_UPDATE
    })
  }
  let transaction;
  try {
    const report = await Report.findOne({
      where: {
        id: req.params.id
      }
    });
    if (report) {
      if (req.body.state !== REPORT_STATE.RESOLVED) {
        await Report.update({
          state: req.body.state
        }, {
          where: {
            id: req.params.id
          }
        });
        return res.status(httpStatus.OK).json({
          message: msg.MSG_SUCCESS
        });
      } else {
        transaction = await connection.sequelize.transaction();
        await Report.update({
          state: req.body.state
        }, {
          where: {
            id: req.params.id
          }
        }, { transaction });
        await Account.update({
          state: STATES.INACTIVE
        }, {
          where: {
            id: report.accountId
          }
        }, { transaction });
        await transaction.commit();
        return res.status(httpStatus.OK).json({
          message: msg.MSG_SUCCESS
        });
      }
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND,
    });
  } catch (error) {
    console.log(error);
    if (transaction) await transaction.rollback();
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_UPDATE
    })
  }
}
