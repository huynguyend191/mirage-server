const Account = require('../models/Account');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const msg = require('../lib/constants/messages');
const constants = require('../lib/constants/constants');
const httpStatus = require('http-status-codes');

exports.login = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        username: req.body.username
      }
    });
    if (account) {
      const match = bcrypt.compareSync(req.body.password, account.password);
      if (match) {
        const token = jwt.sign({
          id: account.id,
          username: account.username,
          role: account.role
        }, process.env.JWT_KEY);
        res.cookie(constants.ACCESS_TOKEN, token, {
          expires: new Date(Date.now() + constants.TOKEN_EXPIRES),
          overwrite: true,
        });
        return res.status(200).json({
          message: msg.MSG_SUCCESS,
          username: account.username
        })
      } else {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: msg.MSG_LOGIN_FAIL
        });
      }
    } else {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: msg.MSG_LOGIN_FAIL
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR)
    });
  }
}