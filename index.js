const https = require('https');
const app = require('./app');
const dotenv =  require('dotenv');
dotenv.config();

const certOptions = require('./lib/utils/httpsCert');
const server = https.createServer(certOptions ,app);

server.listen(process.env.PORT);

console.log(`Server listening on: ${process.env.PORT}`)
