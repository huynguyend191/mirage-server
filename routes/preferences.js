const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferences');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.get('/', checkAuth([roles.STUDENT]), preferenceController.getPreferences);
router.post('/', checkAuth([roles.STUDENT]), preferenceController.createPreference);
router.delete('/:id', checkAuth([roles.STUDENT]), preferenceController.deletePreference);

module.exports = router;
