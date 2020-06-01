const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payments');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/', paymentController.createPayment);
router.get('/:tutorId', paymentController.getTutorPayment);
router.put('/:id', paymentController.updateTutorPayment);
router.get('/', paymentController.getAllPayment);

module.exports = router;
