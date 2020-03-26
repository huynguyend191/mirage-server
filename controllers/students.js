const Account = require('../models/Account');
const Student = require('../models/Student');
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
const paginate = require('../lib/utils/sqlPaginate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve(`uploads/students/${req.params.username}/avatar`);
    if (fs.existsSync(dir)) {
      fsExtra.emptyDirSync(dir);
    } else {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, `./uploads/students/${req.params.username}/avatar`);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

exports.uploadStudentAvatar = multer({ storage: avatarStorage }).single('avatar');
exports.updateStudentAvatar = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: { username: req.params.username }
    });
    if (account) {
      await Student.update({ avatar: req.file.path }, {
        where: { accountId: account.id }
      });
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS
      })
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND
    })
  } catch (error) {
    console.log(error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_UPDATE
    });
  }
}

exports.createStudent = async (req, res) => {
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
        role: roles.STUDENT,
        verification: verfication.UNVERIFIED,
        state: states.ACTIVE
      }, { transaction });
      const studentId = uuid();
      await Student.create({
        id: studentId,
        accountId: accId,
        name: req.body.name
      }, { transaction });
      await transaction.commit();

      const responseAcc = {
        id: accId,
        username: req.body.username,
        role: roles.STUDENT,
        verification: verfication.UNVERIFIED,
        student: {
          id: studentId
        }
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

exports.getAllStudents = async (req, res) => {
  try {
    let searchQuery = {};
    if (req.query.search != "") {
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
    const total = await Student.count({
      include: [{
        model: Account,
        attributes: ['id', 'username', 'email', 'state', 'verification']
      }],
      attributes: ['id', 'name'],
      where: searchQuery
    });
    const page = req.query.page || constants.DEFAULT_PAGE;
    const pageSize = req.query.size || total;
    const totalPages = Math.ceil(total / pageSize);
    const students = await Student.findAll({
      include: [{
        model: Account,
        attributes: ['id', 'username', 'email', 'state', 'verification']
      }],
      attributes: ['id', 'name'],
      where: searchQuery,
      ...paginate({ page, pageSize })
    });
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS,
      students: students,
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

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findOne({
      include: [{
        model: Account,
        attributes: ['id', 'username', 'state', 'verification', 'email']
      }],
      where: { id: req.params.id }
    });
    if (student) {
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS,
        student: student
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

exports.deleteStudent = async (req, res) => {
  let transaction;
  try {
    const student = await Student.findOne({
      where: { id: req.params.id }
    });
    if (student) {
      transaction = await connection.sequelize.transaction();
      await Account.destroy({
        where: { id: student.accountId }
      }, { transaction });
      await Student.destroy({
        where: { id: student.id }
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

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { id: req.params.id }
    });
    if (student) {
      const studentInfo = {
        name: req.body.name || student.name,
        birthdate: Date.parse(req.body.birthdate) || student.birthdate,
        phone: req.body.phone || student.phone,
        student_lvl: req.body.student_lvl || student.student_lvl,
        student_type: req.body.student_type || student.student_type,
        teaching_styles: JSON.stringify(req.body.teaching_styles) || student.teaching_styles,
        accent: req.body.accent || student.accent,
        specialities: JSON.stringify(req.body.specialities) || student.specialities,
      }
      await Student.update(studentInfo, {
        where: { id: student.id }
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
