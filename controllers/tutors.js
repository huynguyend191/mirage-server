const Account = require('../models/Account');
const Tutor = require('../models/Tutor');
const bcrypt = require('bcrypt');
const connection = require('../database/connection');
const uuid = require('uuid').v4;
const msg = require('../lib/constants/messages');
const Op = require('sequelize').Op;
const httpStatus = require('http-status-codes');
const validateEmail = require('../lib/utils/validateData').validateEmail;
const validateString = require('../lib/utils/validateData').validateString;
const roles = require('../lib/constants/account').ROLES;
const states = require('../lib/constants/account').STATES;
const verfication = require('../lib/constants/account').VERIFICATION;
const constants = require('../lib/constants/common');
const jwt = require('jsonwebtoken');
const sendMail = require('../lib/utils/sendMail');

exports.createTutor = async (req, res) => {
  let transaction;
  try {
    if (
      validateString(req.body.username) &&
      validateString(req.body.password) &&
      validateString(req.body.name) &&
      validateEmail(req.body.email)
    ) {
      const existAcc = await Account.findOne({
        where: {
          [Op.or]: [
            { username: req.body.username },
            { email: req.body.email }
          ]
        }
      });
      if (existAcc) {
        return res.status(httpStatus.CONFLICT).json({
          message: msg.MSG_ACC_EXISTED
        });
      }
      transaction = await connection.sequelize.transaction();
      const hashPassword = bcrypt.hashSync(req.body.password, parseInt(process.env.SALT_ROUND));
      const accId = uuid();
      await Account.create({
        id: accId,
        username: req.body.username,
        password: hashPassword,
        email: req.body.email,
        role: roles.TUTOR,
        verification: verfication.UNVERIFIED,
        state: states.ACTIVE
      }, { transaction });
      await Tutor.create({
        id: uuid(),
        accountId: accId,
        name: req.body.name
      }, { transaction });
      await transaction.commit();

      const responseAcc = {
        id: accId,
        username: req.body.username,
        role: roles.TUTOR,
        verification: verfication.UNVERIFIED,
      };

      const token = jwt.sign(responseAcc, process.env.JWT_KEY);
      res.cookie(constants.ACCESS_TOKEN, token, {
        expires: new Date(Date.now() + constants.TOKEN_EXPIRES),
        overwrite: true
      });

      sendMail.verifyMail(req.body.email);
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS,
        account: responseAcc
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({
      message: msg.MSG_FAIL_TO_REGISTER
    });
  } catch (error) {
    console.log(error);
    if (transaction) await transaction.rollback();
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_REGISTER
    });
  }
}
