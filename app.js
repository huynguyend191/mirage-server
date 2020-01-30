const express = require('express');
const cors = require('cors');

const app = express();

app.use(
  cors({
    credentials: true
  })
)

app.get('/', (req, res) => {
  res.send('OK')
})

module.exports = app;
