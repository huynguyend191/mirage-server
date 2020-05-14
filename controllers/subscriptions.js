const Subscription = require('../models/Subscription');
const Student = require('../models/Student');
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const { validateIntNumber } = require('../lib/utils/validateData');
const { STATE, TYPE, DISCOUNT_RATE, DOLLAR_PER_MIN } = require('../lib/constants/subscriptions');
const uuid = require('uuid').v4;

exports.createSubscription = async (req, res) => {
  try {
    if (!req.body.studentId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: msg.MSG_FAIL_TO_CREATE,
      });
    }
    const student = await Student.findOne({
      where: {
        id: req.body.studentId
      }
    });
    if (!validateIntNumber(req.body.duration) || req.body.duration < 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: msg.MSG_FAIL_TO_CREATE,
      });
    }
    if (student) {
      const rawPrice = (req.body.duration / 60000) * PRICE_PER_MIN;
      let price;
      switch (req.body.type) {
        case TYPE.NORMAL:
          price = rawPrice * DISCOUNT_RATE.NORMAL;
          break;
        case TYPE.SILVER:
          price = rawPrice * DISCOUNT_RATE.SILVER;
          break;
        case TYPE.GOLD:
          price = rawPrice * DISCOUNT_RATE.GOLD;
          break;
        case TYPE.PLATIUM:
          price = rawPrice * DISCOUNT_RATE.PLATIUM;
          break;
        default:
          break;
      }
      await Subscription.create({
        id: uuid(),
        duration: req.body.duration,
        state: STATE.PENDING,
        studentId: student.id,
        price: price,
        type: req.body.type
      });
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS,
      });
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND,
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_CREATE
    });
  }
}

exports.getStudentSubscriptions = async (req, res) => {
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
        }
      });
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS,
        subscriptions: subscriptions
      });
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND,
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
}

exports.updateStudentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!validateIntNumber(req.body.state) || req.body.state < 1 || req.body.state > 3) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: msg.MSG_FAIL_TO_UPDATE,
      });
    }
    if (subscription) {
      await Subscription.update({
        state: req.body.state
      }, {
        where: {
          id: req.params.id
        }
      });
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS
      });
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND,
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
}

exports.getAllSubscriptions = async (req, res) => {
  let searchQuery = null;
  if (req.query.state) {
    searchQuery = { state: req.query.state }
  }
  try {
    const subscriptions = await Subscription.findAll({
      where: searchQuery
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
}
