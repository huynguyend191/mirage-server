const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptions');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/', checkAuth([roles.STUDENT]), subscriptionController.createSubscription);
router.get('/:studentId', checkAuth([roles.STUDENT]), subscriptionController.getStudentSubscriptions);
router.put('/:id', checkAuth([roles.ADMIN, roles.STUDENT]), subscriptionController.updateStudentSubscription);
router.get('/', checkAuth([roles.ADMIN]), subscriptionController.getAllSubscriptions);

module.exports = router;
