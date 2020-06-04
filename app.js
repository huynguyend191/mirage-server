const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const schedule = require('node-schedule');

const accountRoutes = require('./routes/accounts');
const tutorRoutes = require('./routes/tutors');
const studentRoutes = require('./routes/students');
const callHistoryRoutes = require('./routes/callHistories');
const reviewRoutes = require('./routes/reviews');
const subscriptionRoutes = require('./routes/subscriptions');
const reportRoutes = require('./routes/reports');
const preferenceRoutes = require('./routes/preferences');
const paymentRoutes = require('./routes/payments');
const statRoutes = require('./routes/stats');

const { createRecommend } = require('./controllers/preferences');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://192.168.0.164:3000',
    credentials: true
  })
);
app.use(morgan('common')); //access logs

app.use('/api/accounts', accountRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/call-histories', callHistoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statRoutes);

app.use('/uploads/students', express.static(__dirname + '/uploads/students'));
app.use('/uploads/tutors', express.static(__dirname + '/uploads/tutors'));

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// auto get recommend tutors for students every Sunday
schedule.scheduleJob('* * 0 * * 7', () => {
  createRecommend();
});

module.exports = app;
