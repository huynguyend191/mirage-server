const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accounts');

router.post('/login', accountController.login);
router.post('/:id/change-password', accountController.changePassword);
router.get('/verify/:id', accountController.verifyAccount)

module.exports = router;
