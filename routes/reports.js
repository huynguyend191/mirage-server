const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reports');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/', reportController.createReport);
router.get('/', reportController.getReports);
router.put('/:id', reportController.updateReport);

module.exports = router;
