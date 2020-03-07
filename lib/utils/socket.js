const io = require('socket.io');
const socketEvents = require('../constants/socketEvents');

const initSocket = (socket) => {
  //TODO implement events
}

const checkAuth = (socket, next) => {
  //TODO verify jwt token
  if(socket.handshake.query.token) {
    next();
  } else {
    next(new Error('Unauthorized'));
  }
}

module.exports = (server) => {
  io.listen(server, { log: true })
  .use(checkAuth)
  .on(socketEvents.CONNECTION, initSocket)
}