const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/', checkAuth([roles.STUDENT]), reviewController.createReview);
router.get('/:tutorId', checkAuth([roles.ADMIN, roles.STUDENT, roles.TUTOR]), reviewController.getTutorReviews);
router.delete('/:id', checkAuth([roles.STUDENT]), reviewController.deleteReview);

module.exports = router;
