const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/', reviewController.createReview);
router.get('/:tutorId', reviewController.getTutorReviews);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
