const express = require('express');
const router = express.Router();
const callHistoriesController = require('../controllers/callHistories');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/', checkAuth(roles.STUDENT), callHistoriesController.createDirCallHistories, callHistoriesController.uploadCallVideos, callHistoriesController.createCallHistory);

module.exports = router;