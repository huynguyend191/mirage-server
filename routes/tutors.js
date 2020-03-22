const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutors');
const checkAuth = require('../middlewares/checkAuth');
const roles = require('../lib/constants/account').ROLES;

router.post('/register', tutorController.createTutor);
router.get('/', tutorController.getAllTutors);
router.get('/:id', tutorController.getTutor);
router.delete('/:id', checkAuth(roles.ADMIN), tutorController.deleteTutor);
router.put('/:id', checkAuth(), tutorController.updateTutor);
router.post('/avatar/:username', tutorController.uploadTutorAvatar, tutorController.updateTutorAvatar);
router.post('/certificates/:username', tutorController.uploadCertificates, tutorController.updateTutorCertificates);
router.post('/video/:username', tutorController.uploadVideo, tutorController.updateTutorVideo);
router.get('/video/:username', tutorController.streamVideo);

module.exports = router;
