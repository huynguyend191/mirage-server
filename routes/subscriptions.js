const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptions');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/', subscriptionController.createSubscription);
router.get('/:studentId', subscriptionController.getStudentSubscriptions);
router.put('/:id', subscriptionController.updateStudentSubscription);
router.get('/', subscriptionController.getAllSubscriptions);

module.exports = router;
