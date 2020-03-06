const Account = require('../models/Account');
const UnverifiedAccount = require('../models/UnverifiedAccount');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const msg = require('../lib/constants/messages');
const constants = require('../lib/constants/common');
const verification = require('../lib/constants/account').VERIFICATION;
const expireVerify = require('../lib/constants/emailInfo').VERIFY_MAIL_EXPIRE;
const state = require('../lib/constants/account').STATES;
const httpStatus = require('http-status-codes');
const generatePass = require('generate-password');
const Op = require('sequelize').Op;
const sendMail = require('../lib/utils/sendMail');
const validateEmail = require('../lib/utils/validateData').validateEmail;

exports.login = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        [Op.or]: [
          { username: req.body.user },
          { email: req.body.user }
        ],
        state: state.ACTIVE
      }
    });
    if (account) {
      const match = bcrypt.compareSync(req.body.password, account.password);
      if (match) {
        const resAcc = {
          id: account.id,
          username: account.username,
          role: account.role,
          verification: account.verification
        }
        const token = jwt.sign(resAcc, process.env.JWT_KEY);
        res.cookie(constants.ACCESS_TOKEN, token, {
          expires: new Date(Date.now() + constants.TOKEN_EXPIRES),
          overwrite: true
        });
        return res.status(httpStatus.OK).json({
          message: msg.MSG_SUCCESS,
          account: resAcc
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
};

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
};

//TO DO: Update redirect URL to front-end
exports.verifyAccount = async (req, res) => {
  try {
    const unverifiedAcc = await UnverifiedAccount.findOne({
      where: {
        id: req.params.id
      }
    });
    if (unverifiedAcc) {
      const createTime = Date.parse(unverifiedAcc.createdAt);
      if (createTime + expireVerify > Date.now()) {
        await Account.update({
          verification: verification.VERIFIED
        },{
          where: {
            email: unverifiedAcc.email
          }
        });
        await UnverifiedAccount.destroy({
          where: {
            id: req.params.id
          }
        });
        return res.redirect("https://www.google.com");
      }
    }
    return res.status(httpStatus.BAD_REQUEST).redirect('https://www.reddit.com/');
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).redirect('https://www.reddit.com/');
  }
};

exports.resetPassword = async (req, res) => {
  try {
    if (req.body.user) {
      const account = await Account.findOne({
        where: {
          [Op.or]: [
            { username: req.body.user },
            { email: req.body.user }
          ],
          state: state.ACTIVE
        }
      });
      if (account) {
        const randomPass = generatePass.generate({
          length: 10,
          numbers: true
        });
        const newPass = bcrypt.hashSync(randomPass, parseInt(process.env.SALT_ROUND));
        await Account.update(
          { password: newPass },
          {
            where: {
              id: account.id
            }
          }
        );
        sendMail.resetPasswordMail(account.email, account.username, randomPass);
        return res.status(httpStatus.OK).json({
          message: msg.MSG_SUCCESS
        });
      }
    }
    return res.status(httpStatus.BAD_REQUEST).json({
      message: msg.MSG_INVALID_ACCOUNT
    })
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_RESET_PASS
    });
  }
}

exports.resendVerify = async (req, res) => {
  try {
    if (validateEmail(req.body.email)) {
      sendMail.verifyMail(req.body.email);
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS
      });  
    }
    return res.status(httpStatus.BAD_REQUEST).json({
      message: msg.MSG_FAIL_RESEND_VERIFY
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_RESEND_VERIFY
    });
  }
}