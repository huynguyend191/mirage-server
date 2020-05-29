const Account = require('../models/Account');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const CallHistory = require('../models/CallHistory');
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
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const Review = require('../models/Review');
const Sequelize = require('sequelize');
const streamVideoFromPath = require('../lib/utils/streamVideoFromPath');

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve(`uploads/tutors/${req.params.username}/avatar`);
    if (fs.existsSync(dir)) {
      fsExtra.emptyDirSync(dir);
    } else {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, `./uploads/tutors/${req.params.username}/avatar`);
  },
  filename: (req, file, cb) => {
    cb(null, 'avatar.png');
  }
});

exports.createDirCertificates = (req, res, next) => {
  const dir = path.resolve(`uploads/tutors/${req.params.username}/certificates`);
  if (fs.existsSync(dir)) {
    fsExtra.emptyDirSync(dir);
  } else {
    fs.mkdirSync(dir, { recursive: true });
  }
  next();
};

const certificatesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./uploads/tutors/${req.params.username}/certificates`);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve(`uploads/tutors/${req.params.username}/video`);
    if (fs.existsSync(dir)) {
      fsExtra.emptyDirSync(dir);
    } else {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, `./uploads/tutors/${req.params.username}/video`);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

exports.uploadTutorAvatar = multer({ storage: avatarStorage }).single('avatar');
exports.uploadCertificates = multer({ storage: certificatesStorage }).array('certificates', 10);
exports.uploadVideo = multer({ storage: videoStorage }).single('video');

exports.streamVideo = async (req, res) => {
  const videoPath = `uploads/tutors/${req.params.username}/video/introVideo.webm`;
  streamVideoFromPath(req, res, videoPath);
};

exports.updateTutorAvatar = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: { username: req.params.username }
    });
    if (account) {
      await Tutor.update(
        { avatar: req.file.path },
        {
          where: { accountId: account.id }
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
};

exports.updateTutorVideo = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: { username: req.params.username }
    });
    if (account) {
      await Tutor.update(
        { video: req.file.path },
        {
          where: { accountId: account.id }
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
};

exports.updateTutorCertificates = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: { username: req.params.username }
    });
    if (account) {
      const tutor = await Tutor.findOne({
        where: { accountId: account.id }
      });
      await Tutor.update(
        { certificates: JSON.stringify(req.files) },
        {
          where: { accountId: account.id }
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
};

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
          [Op.or]: [{ username: req.body.username }, { email: req.body.email }]
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
      await Account.create(
        {
          id: accId,
          username: req.body.username,
          password: hashPassword,
          email: req.body.email,
          role: roles.TUTOR,
          verification: verfication.UNVERIFIED,
          state: states.ACTIVE
        },
        { transaction }
      );
      const tutorId = uuid();
      await Tutor.create(
        {
          id: tutorId,
          accountId: accId,
          name: req.body.name,
          profileStatus: profileStatus.PENDING
        },
        { transaction }
      );
      await transaction.commit();

      const responseAcc = {
        id: accId,
        username: req.body.username,
        role: roles.TUTOR,
        verification: verfication.UNVERIFIED,
        tutor: {
          id: tutorId
        }
      };

      const token = jwt.sign(responseAcc, process.env.JWT_KEY);
      res.cookie(constants.ACCESS_TOKEN, token, {
        expires: new Date(Date.now() + constants.REMEMBER_TOKEN_EXPIRES),
        overwrite: true,
        sameSite: 'None',
        secure: true
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
    if (req.query.search && req.query.search != '') {
      searchQuery = {
        [Op.or]: [
          { name: { [Op.like]: `%${req.query.search}%` } },
          { '$account.email$': { [Op.like]: `%${req.query.search}%` } },
          { '$account.username$': { [Op.like]: `%${req.query.search}%` } }
        ]
      };
    }
    if (req.query.state) {
      searchQuery['$account.state$'] = req.query.state;
    }
    if (req.query.verification) {
      searchQuery['$account.verification$'] = req.query.verification;
    }
    if (req.query.profileStatus) {
      searchQuery.profileStatus = req.query.profileStatus;
    }
    const total = await Tutor.count({
      include: [
        {
          model: Account,
          attributes: ['id', 'username', 'email', 'state', 'verification']
        }
      ],
      attributes: ['id', 'name', 'profileStatus'],
      where: searchQuery
    });
    const page = req.query.page || constants.DEFAULT_PAGE;
    const pageSize = req.query.size || total;
    const totalPages = Math.ceil(total / pageSize);
    const tutors = await Tutor.findAll({
      include: [
        {
          model: Account,
          attributes: ['id', 'username', 'email', 'state', 'verification']
        }
      ],
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
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
  }
};

exports.getTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({
      include: [
        {
          model: Account,
          attributes: ['id', 'username', 'state', 'verification', 'email']
        },
        {
          model: CallHistory,
          include: [
            {
              model: Student,
              include: [
                {
                  model: Account,
                  attributes: ['id', 'username']
                }
              ],
              attributes: ['id', 'name']
            },
            {
              model: Tutor,
              include: [
                {
                  model: Account,
                  attributes: ['id', 'username']
                }
              ],
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      where: { id: req.params.id }
    });
    if (tutor) {
      const review = await Review.findAll({
        where: {
          tutorId: req.params.id
        },
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('rating')), 'avg'],
          [Sequelize.fn('COUNT', Sequelize.col('rating')), 'count']
        ],
        raw: true
      });
      tutor.dataValues.review = {
        avg: review[0].avg,
        count: review[0].count
      };
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS,
        tutor: tutor.dataValues
      });
    }
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    });
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
      await Account.destroy(
        {
          where: { id: tutor.accountId }
        },
        { transaction }
      );
      await Tutor.destroy(
        {
          where: { id: tutor.id }
        },
        { transaction }
      );
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
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_DELETE
    });
  }
};

exports.updateTutor = async (req, res) => {
  if (req.role != roles.ADMIN && req.params.id !== req.user.tutor.id) {
    return res.status(httpStatus.FORBIDDEN).json({
      message: msg.MSG_FORBIDDEN
    });
  }
  try {
    // only admin can send profileStatus
    if (req.body.profileStatus) {
      if (req.role != roles.ADMIN) {
        return res.status(httpStatus.FORBIDDEN).json({
          message: msg.MSG_FORBIDDEN
        });
      }
      if (!Object.values(profileStatus).includes(req.body.profileStatus)) {
        return res.status(httpStatus.BAD_REQUEST).json({
          message: msg.MSG_FAIL_TO_UPDATE
        });
      }
    }
    const tutor = await Tutor.findOne({
      where: { id: req.params.id }
    });
    if (tutor) {
      const tutorInfo = {
        name: req.body.name || tutor.name,
        profileStatus: req.body.profileStatus || profileStatus.PENDING, //if not Admin send, auto set profileStatus to PENDING
        phone: req.body.phone || tutor.phone,
        birthdate: Date.parse(req.body.birthdate) || tutor.birthdate,
        address: req.body.address || tutor.address,
        interests: req.body.interests || tutor.interests,
        education: req.body.education || tutor.education,
        experience: req.body.experience || tutor.experience,
        profession: req.body.profession || tutor.profession,
        certificates: req.body.certificates || tutor.certificates,
        reason: req.body.reason || tutor.reason,
        introduction: req.body.introduction || tutor.introduction,
        video: req.body.video || tutor.video,
        student_lvl: req.body.student_lvl || tutor.student_lvl,
        student_type: req.body.student_type || tutor.student_type,
        teaching_styles: JSON.stringify(req.body.teaching_styles) || tutor.teaching_styles,
        accent: req.body.accent || tutor.accent,
        fluency: req.body.fluency || tutor.fluency,
        specialities: JSON.stringify(req.body.specialities) || tutor.specialities
      };
      await Tutor.update(tutorInfo, {
        where: { id: tutor.id }
      });
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
