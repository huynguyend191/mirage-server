const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reports');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/', checkAuth([roles.STUDENT, roles.TUTOR]), reportController.createReport);
router.get('/', checkAuth([roles.ADMIN]), reportController.getReports);
router.put('/:id', checkAuth([roles.ADMIN]), reportController.updateReport);

module.exports = router;
