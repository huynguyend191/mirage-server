const Subscription = require('../models/Subscription');
const Student = require('../models/Student');
const Account = require('../models/Account');
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const { validateIntNumber } = require('../lib/utils/validateData');
const { STATE, TIER, DISCOUNT_RATE, PRICE_PER_MIN } = require('../lib/constants/subscriptions');
const uuid = require('uuid').v4;
const connection = require('../database/connection');

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
      switch (req.body.tier) {
        case TIER.NORMAL:
          price = rawPrice * DISCOUNT_RATE.NORMAL;
          break;
        case TIER.SILVER:
          price = rawPrice * DISCOUNT_RATE.SILVER;
          break;
        case TIER.GOLD:
          price = rawPrice * DISCOUNT_RATE.GOLD;
          break;
        case TIER.PLATIUM:
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
        price: price.toFixed(2),
        tier: req.body.tier
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
        },
        order: [
          ['createdAt', 'DESC']
        ]
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
  let transaction;
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
      if (req.body.state !== STATE.COMPLETED) {
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
      } else {
        const student = await Student.findOne({
          where: { id: subscription.studentId }
        })
        const newTime = student.remaining_time + subscription.duration;
        transaction = await connection.sequelize.transaction();
        await Subscription.update({
          state: req.body.state
        }, {
          where: {
            id: req.params.id
          }
        }, { transaction });
        await Student.update({
          remaining_time: newTime
        }, {
          where: {
            id: student.id
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
    });
  }
}

exports.getAllSubscriptions = async (req, res) => {
  let searchQuery = {};
  if (req.query.state) {
    searchQuery.state = req.query.state
  }
  if (req.query.tier) {
    searchQuery.tier = req.query.tier
  }
  try {
    const subscriptions = await Subscription.findAll({
      where: searchQuery,
      order: [
        ['createdAt', 'DESC']
      ],
      include: [
        { 
          model: Student, 
          include: [{
            model: Account,
            attributes: ['id', 'username']
          }]
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
}
