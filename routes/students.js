const express = require('express');
const router = express.Router();
const studentController = require('../controllers/students');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/register', studentController.createStudent);
router.get('/', checkAuth([roles.ADMIN]), studentController.getAllStudents);
router.get('/:id', checkAuth([roles.ADMIN, roles.STUDENT, roles.TUTOR]), studentController.getStudent);
router.delete('/:id', checkAuth([roles.ADMIN]), studentController.deleteStudent);
router.put('/:id', checkAuth([roles.STUDENT]), studentController.updateStudent);
router.post(
  '/avatar/:username',
  checkAuth([roles.STUDENT]),
  studentController.uploadStudentAvatar,
  studentController.updateStudentAvatar
);

module.exports = router;
