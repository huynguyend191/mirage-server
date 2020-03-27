const io = require('socket.io');
const socketEvents = require('../constants/socketEvents');
const jwt = require('jsonwebtoken');
const { onlineUsersList, createUser } = require('../utils/onlineUsers');

const initSocket = (socket) => {
  let id;
  socket
    .on('init', ({tutor}) => {
      createUser(socket, tutor);
      socket.emit('init', { onlineUsersList: Object.keys(onlineUsersList) });
    })
    // .on('request', (data) => {
    //   const receiver = users.get(data.to);
    //   if (receiver) {
    //     receiver.emit('request', { from: id });
    //   }
    // })
    // .on('call', (data) => {
    //   const receiver = users.get(data.to);
    //   if (receiver) {
    //     receiver.emit('call', { ...data, from: id });
    //   } else {
    //     socket.emit('failed');
    //   }
    // })
    // .on('end', (data) => {
    //   const receiver = users.get(data.to);
    //   if (receiver) {
    //     receiver.emit('end');
    //   }
    // })
    // .on('disconnect', () => {
    //   users.remove(id);
    //   console.log(id, 'disconnected');
    // });
}

const checkAuth = (socket, next) => {
  //TODO verify jwt token
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
  .on(socketEvents.CONNECTION, initSocket)
}