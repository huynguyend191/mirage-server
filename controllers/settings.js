const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Subscription = require('../models/Subscription');
const Setting = require('../models/Setting');
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const { STATE } = require('../lib/constants/payment');
const subState = require('../lib/constants/subscriptions').STATE;
const sequelize = require('sequelize');

exports.updateSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne({
      where: {
        id: req.params.id
      }
    });
    if (setting) {
      await Setting.update(
        {
          content: req.body.content
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
}

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
      settings
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_UPDATE
    });
  }
}