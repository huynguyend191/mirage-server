const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const accountRoutes = require('./routes/accounts');
const preferenceRoutes = require('./routes/preferences');
const tutorRoutes = require('./routes/tutors');
const studentRoutes = require('./routes/students');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true
  })
)
app.use(morgan('common')); //access logs

app.use('/accounts', accountRoutes);
app.use('/preferences', preferenceRoutes);
app.use('/tutors', tutorRoutes);
app.use('/students', studentRoutes);

module.exports = app;
