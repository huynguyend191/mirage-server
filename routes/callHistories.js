const express = require('express');
const router = express.Router();
const callHistoriesController = require('../controllers/callHistories');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

module.exports = router;