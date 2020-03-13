const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const accountRoutes = require('./routes/accounts');
const preferenceRoutes = require('./routes/preferences');
const tutorRoutes = require('./routes/tutors');
const studentRoutes = require('./routes/students');

const checkAuth = require('./middlewares/checkAuth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(
//   cors({
//     origin: 'https://localhost:3000',
//     credentials: true
//   })
// )
app.use(morgan('common')); //access logs

app.use('/api/accounts', accountRoutes);
app.use('/api/preferences', checkAuth(), preferenceRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/students', studentRoutes);

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

module.exports = app;
