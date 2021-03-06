const Account = require('../models/Account');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const UnverifiedAccount = require('../models/UnverifiedAccount');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const msg = require('../lib/constants/messages');
const constants = require('../lib/constants/common');
const verification = require('../lib/constants/account').VERIFICATION;
const state = require('../lib/constants/account').STATES;
const httpStatus = require('http-status-codes');
const generatePass = require('generate-password');
const Op = require('sequelize').Op;
const sendMail = require('../lib/utils/sendMail');
const validateEmail = require('../lib/utils/validateData').validateEmail;
const ROLES = require('../lib/constants/account').ROLES;
const ACC_STATE = require('../lib/constants/account').STATES;

exports.signIn = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        [Op.or]: [{ username: req.body.user }, { email: req.body.user }],
        state: state.ACTIVE
      }
    });
    if (account) {
      const match = bcrypt.compareSync(req.body.password, account.password);
      if (match) {
        const resAcc = {
          id: account.id,
          username: account.username,
          email: account.email,
          role: account.role,
          verification: account.verification
        };
        if (account.role === ROLES.TUTOR) {
          const tutor = await Tutor.findOne({
            where: { accountId: account.id }
          });
          resAcc.tutor = tutor;
        } else if (account.role === ROLES.STUDENT) {
          const student = await Student.findOne({
            where: { accountId: account.id }
          });
          resAcc.student = student;
        }
        const token = jwt.sign(resAcc, process.env.JWT_KEY);
        let expireTime = constants.NO_REMEMBER_TOKEN_EXPIRES;
        if (req.body.remember) {
          expireTime = constants.REMEMBER_TOKEN_EXPIRES;
        }
        res.cookie(constants.ACCESS_TOKEN, token, {
          expires: new Date(Date.now() + expireTime),
          overwrite: true,
          sameSite: 'None',
          secure: true
        });
        return res.status(httpStatus.OK).json({
          message: msg.MSG_SUCCESS,
          account: resAcc
        });
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

exports.verifyAccount = async (req, res) => {
  try {
    const unverifiedAcc = await UnverifiedAccount.findOne({
      where: {
        id: req.params.id
      }
    });
    if (unverifiedAcc) {
      await Account.update(
        {
          verification: verification.VERIFIED
        },
        {
          where: {
            email: unverifiedAcc.email
          }
        }
      );
      await UnverifiedAccount.destroy({
        where: {
          id: req.params.id
        }
      });
      return res.redirect(process.env.CLIENT_URL + '/sign-out');
    }
    return res.status(httpStatus.BAD_REQUEST).redirect(process.env.CLIENT_URL);
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).redirect(process.env.CLIENT_URL);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    if (req.body.user) {
      const account = await Account.findOne({
        where: {
          [Op.or]: [{ username: req.body.user }, { email: req.body.user }],
          state: state.ACTIVE,
          role: { [Op.not]: ROLES.ADMIN }
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
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_RESET_PASS
    });
  }
};

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
};

exports.updateAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: { id: req.params.id }
    });
    if (!Object.values(state).includes(req.body.state)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: msg.MSG_FAIL_TO_UPDATE
      });
    }
    if (account) {
      await Account.update(
        {
          state: req.body.state
        },
        {
          where: { id: account.id }
        }
      );
      if (req.body.state === ACC_STATE.INACTIVE) {
        sendMail.banAccountMail(account.email);
      }
      if (req.body.state === ACC_STATE.ACTIVE) {
        sendMail.unbanAccountMail(account.email);
      }
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
