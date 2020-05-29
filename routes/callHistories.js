const express = require('express');
const router = express.Router();
const callHistoriesController = require('../controllers/callHistories');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.get('/', checkAuth([roles.ADMIN, roles.STUDENT, roles.TUTOR]), callHistoriesController.getCallHistories);
router.get(
  '/:id/studentVideo',
  checkAuth([roles.ADMIN, roles.STUDENT, roles.TUTOR]),
  callHistoriesController.getStudenRecord
);
router.get(
  '/:id/tutorVideo',
  checkAuth([roles.ADMIN, roles.STUDENT, roles.TUTOR]),
  callHistoriesController.getTutorRecord
);

module.exports = router;
