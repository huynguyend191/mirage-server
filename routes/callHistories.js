const express = require('express');
const router = express.Router();
const callHistoriesController = require('../controllers/callHistories');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.get('/', callHistoriesController.getCallHistories);
router.get('/:id/studentVideo', callHistoriesController.getStudenRecord);
router.get('/:id/tutorVideo', callHistoriesController.getTutorRecord);

module.exports = router;