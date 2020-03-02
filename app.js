const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const accountRoutes = require('./routes/accounts');

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

module.exports = app;
