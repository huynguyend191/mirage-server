const Subscription = require('../models/Subscription');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const CallHistory = require('../models/CallHistory');
const Payment = require('../models/Payment');
const Account = require('../models/Account');
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const { validateIntNumber } = require('../lib/utils/validateData');
const { STATE, PAYMENT_PER_MIN } = require('../lib/constants/subscriptions');
const { HISTORY_COUNT } = require('../lib/constants/account');
const uuid = require('uuid').v4;
const connection = require('../database/connection');

exports.createPayment = async (req, res) => {
  try {
    if (!req.body.tutorId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: msg.MSG_FAIL_TO_CREATE
      });
    }
    const tutor = await Tutor.findOne({
      where: {
        id: req.body.tutorId
      }
    });
    if (tutor) {
      const uncountedHistory = await CallHistory.findAll({
        where: {
          tutorId: tutor.id,
          counted: HISTORY_COUNT.UNCOUNTED
        }
      });
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS,
        uncountedHistory
      });
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_CREATE
    });
  }
};

exports.getTutorPayment = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: {
        id: req.params.studentId
      }
    });
    if (student) {
      const subscriptions = await Subscription.findAll({
        where: {
          studentId: student.id
        },
        order: [['createdAt', 'DESC']]
      });
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS,
        subscriptions: subscriptions
      });
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
};

exports.updateTutorPayment = async (req, res) => {
  let transaction;
  try {
    const subscription = await Subscription.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!validateIntNumber(req.body.state) || req.body.state < 1 || req.body.state > 3) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: msg.MSG_FAIL_TO_UPDATE
      });
    }
    if (subscription) {
      if (req.body.state !== STATE.COMPLETED) {
        await Subscription.update(
          {
            state: req.body.state
          },
          {
            where: {
              id: req.params.id
            }
          }
        );
        return res.status(httpStatus.OK).json({
          message: msg.MSG_SUCCESS
        });
      } else {
        const student = await Student.findOne({
          where: { id: subscription.studentId }
        });
        const newTime = student.remaining_time + subscription.duration;
        transaction = await connection.sequelize.transaction();
        await Subscription.update(
          {
            state: req.body.state
          },
          {
            where: {
              id: req.params.id
            }
          },
          { transaction }
        );
        await Student.update(
          {
            remaining_time: newTime
          },
          {
            where: {
              id: student.id
            }
          },
          { transaction }
        );
        await transaction.commit();
        return res.status(httpStatus.OK).json({
          message: msg.MSG_SUCCESS
        });
      }
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND
    });
  } catch (error) {
    console.log(error);
    if (transaction) await transaction.rollback();
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_UPDATE
    });
  }
};

exports.getAllPayment = async (req, res) => {
  let searchQuery = {};
  if (req.query.state) {
    searchQuery.state = req.query.state;
  }
  if (req.query.tier) {
    searchQuery.tier = req.query.tier;
  }
  try {
    const subscriptions = await Subscription.findAll({
      where: searchQuery,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Student,
          include: [
            {
              model: Account,
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
      subscriptions: subscriptions
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
};
