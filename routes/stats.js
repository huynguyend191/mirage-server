const express = require('express');
const router = express.Router();
const statController = require('../controllers/stats');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.get('/money', checkAuth([roles.ADMIN]), statController.getMoneyStats);
router.get('/top-paid', checkAuth([roles.ADMIN]), statController.getTopPaid);

module.exports = router;
