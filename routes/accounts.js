const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accounts');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/sign-in', accountController.signIn);
router.post(
  '/:id/change-password',
  checkAuth([roles.ADMIN, roles.STUDENT, roles.TUTOR]),
  accountController.changePassword
);
router.get('/verify/:id', accountController.verifyAccount);
router.post('/reset-password', accountController.resetPassword);
router.post('/resend-verify', accountController.resendVerify);
router.put('/:id', checkAuth([roles.ADMIN]), accountController.updateAccount);

module.exports = router;
