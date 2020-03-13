const Account = require('../models/Account');
const Preference = require('../models/Preference');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const AccountPreference = require('../models/AccountPreference');
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
const connection = require('../database/connection');
const ROLES = require('../lib/constants/account').ROLES;

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
          email: account.email,
          role: account.role,
          verification: account.verification
        }
        if (account.role === ROLES.TUTOR) {
          const tutor = await Tutor.findOne({
            where: { accountId: account.id}
          });
          resAcc.tutor = tutor;
        } else if (account.role === ROLES.STUDENT) {
          const student = await Student.findOne({
            where: { accountId: account.id}
          });
          resAcc.student = student;
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
        }, {
          where: {
            email: unverifiedAcc.email
          }
        });
        await UnverifiedAccount.destroy({
          where: {
            id: req.params.id
          }
        });
        return res.redirect('https://localhost:3000/logout');
      }
    }
    return res.status(httpStatus.BAD_REQUEST).redirect('https://localhost:3000');
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).redirect('https://localhost:3000');
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
        message: msg.MSG_FAIL_TO_UPDATE,
      });
    }
    if (account) {
      await Account.update({
        state: req.body.state
      }, {
        where: { id: account.id }
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
      message: msg.MSG_FAIL_TO_UPDATE
    })
  }
};

exports.getAccPreferences = async (req, res) => {
  try {
    const account = await Account.findOne({
      include: [{
        model: Preference,
        attributes: ['id', 'type', 'value']
      }],
      attributes: ['id'],
      where: { id: req.params.id }
    });
    if (account) {
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS,
        account: account
      });
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND,
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    })
  }
};

exports.updateAccPreferences = async (req, res) => {
  let transaction;
  try {
    if (!Array.isArray(req.body.preferences)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: msg.MSG_FAIL_TO_UPDATE
      });
    }
    const account = await Account.findOne({
      where: { id: req.params.id }
    });
    if (account) {
      transaction = await connection.sequelize.transaction();
      await AccountPreference.destroy({
        where: {
          accountId: account.id
        }
      }, { transaction });
      const accPre = [];
      req.body.preferences.forEach(preferenceId => {
        accPre.push({
          accountId: account.id,
          preferenceId: preferenceId
        })
      });
      await AccountPreference.bulkCreate(accPre, { transaction, returning: true });
      await transaction.commit();
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS
      });
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND
    });
  } catch (error) {
    console.log(error);
    if (transaction) await transaction.rollback();
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_UPDATE
    })
  }
}