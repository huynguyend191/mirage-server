// const https = require('https');
const http = require('http');
const app = require('./app');
const dotenv =  require('dotenv');
// const certOptions = require('./utils/httpsCert');

// const server = https.createServer(certOptions ,app);
const server = http.createServer(app);
dotenv.config();

server.listen(process.env.PORT);

console.log(`Server listening on: ${process.env.PORT}`)
