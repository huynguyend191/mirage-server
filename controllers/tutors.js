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
const profileStatus = require('../lib/constants/account').PROFILE_STATUS;
const verfication = require('../lib/constants/account').VERIFICATION;
const constants = require('../lib/constants/common');
const jwt = require('jsonwebtoken');
const sendMail = require('../lib/utils/sendMail');
const paginate = require('../lib/utils/sqlPaginate');

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
        role: roles.USER,
        verification: verfication.UNVERIFIED,
        state: states.ACTIVE
      }, { transaction });
      await Tutor.create({
        id: uuid(),
        accountId: accId,
        name: req.body.name,
        profileStatus: profileStatus.PENDING
      }, { transaction });
      await transaction.commit();

      const responseAcc = {
        id: accId,
        username: req.body.username,
        role: roles.USER,
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
};

exports.getAllTutors = async (req, res) => {
  try {
    let searchQuery = {};
    if (req.query.search) {
      searchQuery = {
        [Op.or]: [
          { name: { [Op.like]: `%${req.query.search}%` } },
          { '$account.email$': { [Op.like]: `%${req.query.search}%` } },
          { '$account.username$': { [Op.like]: `%${req.query.search}%` } },
        ]
      }
    }
    if (req.query.state) {
      searchQuery['$account.state$'] = req.query.state
    }
    if (req.query.verification) {
      searchQuery['$account.verification$'] = req.query.verification
    }
    if (req.query.profileStatus) {
      searchQuery.profileStatus = req.query.profileStatus
    }
    const total = await Tutor.count({
      include: [{
        model: Account,
        attributes: ['id', 'username', 'email', 'state', 'verification']
      }],
      attributes: ['id', 'name', 'profileStatus'],
      where: searchQuery
    });
    const page = req.query.page || constants.DEFAULT_PAGE;
    const pageSize = req.query.size || total;
    const totalPages = Math.ceil(total / pageSize);
    const tutors = await Tutor.findAll({
      include: [{
        model: Account,
        attributes: ['id', 'username', 'email', 'state', 'verification']
      }],
      attributes: ['id', 'name', 'profileStatus'],
      where: searchQuery,
      ...paginate({ page, pageSize })
    });
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
      tutors: tutors,
      totalResults: total,
      totalPages: totalPages
    });
  }
  catch (error) {
    console.log(error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    })
  }
};

exports.getTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({
      include: [{
        model: Account,
        attributes: ['id', 'username', 'state', 'verification']
      }],
      where: { id: req.params.id }
    });
    if (tutor) {
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS,
        tutor: tutor
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

exports.deleteTutor = async (req, res) => {
  let transaction;
  try {
    const tutor = await Tutor.findOne({
      where: { id: req.params.id }
    });
    if (tutor) {
      transaction = await connection.sequelize.transaction();
      await Account.destroy({
        where: { id: tutor.accountId }
      }, { transaction });
      await Tutor.destroy({
        where: { id: tutor.id }
      }, { transaction });
      await transaction.commit();
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
      message: msg.MSG_FAIL_TO_DELETE
    })
  }
};

exports.updateTutor = async (req, res) => {
  try {
    if (req.body.profileStatus) {
      if (req.role != roles.ADMIN) {
        return res.status(httpStatus.FORBIDDEN).json({
          message: msg.MSG_FORBIDDEN
        });
      }
      if (!Object.values(profileStatus).includes(parseInt(req.body.profileStatus))) {
        return res.status(httpStatus.BAD_REQUEST).json({
          message: msg.MSG_FAIL_TO_UPDATE
        });
      }
    }
    const tutor = await Tutor.findOne({
      where: { id: req.params.id }
    });
    const tutorInfo = {
      name: req.body.name || tutor.name,
      profileStatus: req.body.profileStatus || tutor.profileStatus,
      phone: req.body.phone || tutor.phone,
      birthdate: req.body.birthdate || tutor.birthdate,
      address: req.body.address || tutor.address,
      interests: req.body.interests || tutor.interests,
      education: req.body.education || tutor.education,
      experience: req.body.experience || tutor.experience,
      profession: req.body.profession || tutor.profession,
      certificates: req.body.certificates || tutor.certificates,
      reason: req.body.reason || tutor.reason,
      introduction: req.body.introduction || tutor.introduction,
      avatar: req.body.avatar || tutor.avatar,
      video: req.body.video || tutor.video,
    }
    if (tutor) {
      await Tutor.update(tutorInfo, {
        where: { id: tutor.id }
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

