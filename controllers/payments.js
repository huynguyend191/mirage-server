const Tutor = require('../models/Tutor');
const CallHistory = require('../models/CallHistory');
const Payment = require('../models/Payment');
const Account = require('../models/Account');
const Setting = require('../models/Setting');
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const { validateIntNumber } = require('../lib/utils/validateData');
const { HISTORY_COUNT, PAYMENT_PER_MIN, STATE, MIN_VAL } = require('../lib/constants/payment');
const { TUTOR_PRICE } = require('../lib/constants/common');

const uuid = require('uuid').v4;
const connection = require('../database/connection');

exports.createPayment = async (req, res) => {
  if (req.body.tutorId !== req.user.tutor.id) {
    return res.status(httpStatus.FORBIDDEN).json({
      message: msg.MSG_FORBIDDEN
    });
  }
  let transaction;
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
      const paymentId = uuid();
      const uncountedHistory = await CallHistory.findAll({
        where: {
          tutorId: tutor.id,
          counted: HISTORY_COUNT.UNCOUNTED
        },
        raw: true
      });
      console.log(uncountedHistory)
      if (uncountedHistory.length > 0) {
        let duration = 0;
        transaction = await connection.sequelize.transaction();
        uncountedHistory.forEach(async history => {
          duration += history.duration;
        });
        const paymentPerMin = await Setting.findOne({
          where: {
            type: TUTOR_PRICE
          }
        });
        const price = ((duration / 60000) * Number(paymentPerMin.dataValues.content)).toFixed(2);
        if (price < MIN_VAL) {
          return res.status(httpStatus.BAD_REQUEST).json({
            message: msg.MSG_PAYMENT_VALUE_SMALL
          });
        } else {
          uncountedHistory.forEach(async history => {
            duration += history.duration;
            await CallHistory.update(
              {
                counted: HISTORY_COUNT.COUNTED,
                paymentId: paymentId
              },
              { where: { id: history.id }, transaction }
            );
          });
          await Payment.create(
            {
              id: paymentId,
              tutorId: tutor.id,
              price: price,
              state: STATE.PENDING
            },
            { transaction }
          );
          await transaction.commit();
          return res.status(httpStatus.OK).json({
            message: msg.MSG_SUCCESS
          });
        }
      }
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND
    });
  } catch (error) {
    console.log(error);
    if (transaction) await transaction.rollback();
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_CREATE
    });
  }
};

exports.getTutorPayment = async (req, res) => {
  if (req.params.tutorId !== req.user.tutor.id) {
    return res.status(httpStatus.FORBIDDEN).json({
      message: msg.MSG_FORBIDDEN
    });
  }
  try {
    const tutor = await Tutor.findOne({
      where: {
        id: req.params.tutorId
      }
    });
    if (tutor) {
      const payments = await Payment.findAll({
        where: {
          tutorId: tutor.id
        },
        order: [['createdAt', 'DESC']]
      });
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS,
        payments: payments
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
  try {
    const payment = await Payment.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!validateIntNumber(req.body.state) || req.body.state < 1 || req.body.state > 3) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: msg.MSG_FAIL_TO_UPDATE
      });
    }
    if (payment) {
      await Payment.update(
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
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND
    });
  } catch (error) {
    console.log(error);
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
  try {
    const payments = await Payment.findAll({
      where: searchQuery,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Tutor,
          attributes: ['id', 'name'],
          include: [
            {
              model: Account,
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ]
    });
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
      payments: payments
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
};
