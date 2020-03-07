const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutors');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/register', tutorController.createTutor);
router.get('/', tutorController.getAllTutors);
router.get('/:id', tutorController.getTutor);
router.delete('/:id', checkAuth(roles.ADMIN), tutorController.deleteTutor);
router.put('/:id', checkAuth(roles.USER), tutorController.updateTutor);

module.exports = router;
