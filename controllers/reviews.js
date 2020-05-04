const Review = require('../models/Review');
const Tutor = require('../models/Tutor');
const uuid = require('uuid').v4;
const { validateIntNumber, validateString } = require('../lib/utils/validateData')
const httpStatus = require('http-status-codes');
const msg = require('../lib/constants/messages');
const Sequelize =  require('sequelize');

exports.createReview = async (req, res) => {
  try {
    if (!validateString(req.body.comment) || !validateIntNumber(req.body.rating)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: msg.MSG_FAIL_TO_CREATE
      });
    }
    if (req.body.rating > 5 || req.body.rating < 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: msg.MSG_FAIL_TO_CREATE
      });
    }
    await Review.create({
      id: uuid(),
      tutorId: req.body.tutorId,
      studentId: req.body.studentId,
      rating: req.body.rating,
      comment: req.body.comment
    });
    return res.status(httpStatus.OK).json({
      message: msg.MSG_SUCCESS
    })
  } catch (error) {
    console.log(error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_CREATE
    })
  }
}

exports.getTutorReviews = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({
      where: {
        id: req.params.tutorId
      }
    });
    if (tutor) {
      const reviews = await Review.findAll({
        where: {
          tutorId: req.params.tutorId
        }
      });
      const avg = await Review.findAll({
        where: {
          tutorId: req.params.tutorId,
        },
        attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'avg']],
        raw: true,
      });
      console.log(avg)
      return res.status(httpStatus.OK).json({
        message: msg.MSG_SUCCESS,
        reviews: reviews,
        avg: avg[0].avg
      })
    };
    return res.status(httpStatus.NOT_FOUND).json({
      message: msg.MSG_NOT_FOUND
    });
  } catch (error) {
    console.log(error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: msg.MSG_FAIL_TO_READ
    })
  }
}