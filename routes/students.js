const express = require('express');
const router = express.Router();
const studentController = require('../controllers/students');

router.post('/register', studentController.createStudent);

module.exports = router;
