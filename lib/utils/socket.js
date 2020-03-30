const io = require('socket.io');
const SOCKET_EVENTS = require('../constants/socketEvents');
const jwt = require('jsonwebtoken');
const onlineUsers = require('../utils/onlineUsers');
const { STATUS } = require('../constants/account');

const initSocket = (socket) => {
  let username;
  socket
    .on(SOCKET_EVENTS.INIT, (data) => {
      username = data.account.username;
      onlineUsers.create(socket, data.account);
      console.log(onlineUsers.getAll());
      socket.emit(SOCKET_EVENTS.INIT, { id: username });
    })
    .on(SOCKET_EVENTS.REQUEST, (data) => {
      const receiver = onlineUsers.getOne(data.to);
      if (receiver && receiver.status !== STATUS.BUSY) {
        onlineUsers.setStatus(username, STATUS.BUSY)
        onlineUsers.setStatus(data.to, STATUS.BUSY);
        receiver.socket.emit(SOCKET_EVENTS.REQUEST, { from: username });
      }
    })
    .on(SOCKET_EVENTS.CALL, (data) => {
      const receiver = onlineUsers.getOne(data.to);
      if (receiver) {
        receiver.socket.emit(SOCKET_EVENTS.CALL, { ...data, from: username });
      } else {
        socket.emit('failed');
      }
    })
    .on(SOCKET_EVENTS.END, (data) => {
      const receiver = onlineUsers.getOne(data.to);
      if (receiver) {
        onlineUsers.setStatus(username, STATUS.AVAILABLE);
        onlineUsers.setStatus(data.to, STATUS.AVAILABLE);
        receiver.socket.emit(SOCKET_EVENTS.END);
      }
    })
    .on(SOCKET_EVENTS.DISCONNECT, () => {
      onlineUsers.remove(username);
      console.log(username, 'disconnected');
    });
}

const checkAuth = (socket, next) => {
  if(socket.handshake.query.token) {
    try {
      jwt.verify(socket.handshake.query.token, process.env.JWT_KEY);
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  } else {
    next(new Error('Unauthorized'));
  }
}

module.exports = (server) => {
  io.listen(server, { log: true })
  .use(checkAuth)
  .on(SOCKET_EVENTS.CONNECTION, initSocket)
}