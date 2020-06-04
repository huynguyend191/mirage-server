const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Subscription = require('../models/Subscription');
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const { STATE } = require('../lib/constants/payment');
const subState = require('../lib/constants/subscriptions').STATE;
const sequelize = require('sequelize');

exports.getMoneyStats = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: {
        state: STATE.COMPLETED
      }
    });
    const subscriptions = await Subscription.findAll({
      where: {
        state: subState.COMPLETED
      }
    });
    let earn = 0;
    let pay = 0;
    payments.forEach(payment => {
      pay += payment.dataValues.price;
    });
    subscriptions.forEach(sub => {
      earn += sub.dataValues.price;
    });
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
      stats: {
        earn,
        pay
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
};

exports.getTopPaid = async (req, res) => {
  try {
    const topPaid = await Subscription.findAll({
      attributes: ['studentId', [sequelize.fn('sum', sequelize.col('price')), 'total']],
      group: ['studentId'],
      where: {
        state: subState.COMPLETED
      },
      include: [Student],
      order: [[sequelize.col('total'), 'DESC']],
      limit: 5
    });
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
      topPaid
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
};
