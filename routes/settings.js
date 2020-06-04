const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settings');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.put('/:id', checkAuth([roles.ADMIN]), settingController.updateSetting);
router.get('/', settingController.getSettings);

module.exports = router;
