const Preference = require('../models/Preference');
const msg = require('../lib/constants/messages');
const httpStatus = require('http-status-codes');

exports.getAllPreferences = async (req, res) => {
  try {
    const preferences = await Preference.findAll({
      order: [
        ['type', 'ASC']
      ],
      attributes: ['id', 'type', 'key', 'value']
    });
    res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
      preferences
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    })
  }
};