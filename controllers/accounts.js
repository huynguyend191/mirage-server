const Account = require('../models/Account');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const msg = require('../lib/constants/messages');
const constants = require('../lib/constants/common');
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
        return res.status(httpStatus.OK).json({
          message: msg.MSG_SUCCESS,
          account: {
            id: account.id,
            username: account.username,
            role: account.role
          }
        })
      }
    }
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: msg.MSG_LOGIN_FAIL
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR)
    });
  }
}

exports.changePassword = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        id: req.params.id
      }
    });
    if (account) {
      const match = bcrypt.compareSync(req.body.oldPassword, account.password);
      if (match) {
        const newPass = bcrypt.hashSync(req.body.newPassword, parseInt(process.env.SALT_ROUND));
        await Account.update(
          { password: newPass },
          {
            where: {
              id: account.id
            }
          }
        );
        return res.status(httpStatus.OK).json({
          message: msg.MSG_SUCCESS
        });
      }
    }
    return res.status(httpStatus.BAD_REQUEST).json({
      message: msg.MSG_CHANGE_PASS_FAIL
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_CHANGE_PASS_FAIL
    });
  }
}