const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accounts');

router.post('/admin/login', accountController.adminLogin);
router.post('/:id/change-password', accountController.changePassword);

module.exports = router;
