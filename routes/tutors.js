const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutors');

router.post('/register', tutorController.createTutor);

module.exports = router;
