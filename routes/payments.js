const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payments');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/', checkAuth([roles.TUTOR]), paymentController.createPayment);
router.get('/:tutorId', checkAuth([roles.TUTOR]), paymentController.getTutorPayment);
router.put('/:id', checkAuth([roles.ADMIN]), paymentController.updateTutorPayment);
router.get('/', checkAuth([roles.ADMIN]), paymentController.getAllPayment);

module.exports = router;
