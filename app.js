const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const accountRoutes = require('./routes/accounts');
const tutorRoutes = require('./routes/tutors');
const studentRoutes = require('./routes/students');
const callHistoryRoutes = require('./routes/callHistories');
const reviewRoutes = require('./routes/reviews');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://localhost:3000',
    credentials: true
  })
);
app.use(morgan('common')); //access logs

app.use('/api/accounts', accountRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/call-histories', callHistoryRoutes);
app.use('/api/reviews', reviewRoutes);

app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

module.exports = app;
