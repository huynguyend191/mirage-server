const http = require('http');
const app = require('./app');
const dotenv =  require('dotenv');
const socket = require('./lib/utils/socket');
dotenv.config();

// const certOptions = require('./lib/utils/httpsCert');
const server = http.createServer(app);

server.listen(process.env.PORT);
socket(server);

console.log(`Server listening on: ${process.env.PORT}`)
