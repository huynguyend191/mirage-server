const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferences');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.get('/', preferenceController.getPreferences);
router.post('/', preferenceController.createPreference);

module.exports = router;
