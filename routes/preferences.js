const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferences');

router.get('/', preferenceController.getAllPreferences);

module.exports = router;
