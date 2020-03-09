const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accounts');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/login', accountController.login);
router.post('/:id/change-password', checkAuth(), accountController.changePassword);
router.get('/verify/:id', accountController.verifyAccount);
router.post('/reset-password', accountController.resetPassword);
router.post('/resend-verify', accountController.resendVerify);
router.put('/:id', checkAuth(roles.ADMIN) ,accountController.updateAccount);
router.get('/:id/preferences', checkAuth(), accountController.getAccPreferences);
router.post('/:id/preferences', checkAuth(), accountController.updateAccPreferences);

module.exports = router;
