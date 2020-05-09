const io = require('socket.io');
const SOCKET_EVENTS = require('../constants/socketEvents');
const jwt = require('jsonwebtoken');
const onlineUsers = require('../utils/onlineUsers');
const { STATUS, ROLES } = require('../constants/account');
const CallHistory = require('../../models/CallHistory');
const uuid = require('uuid').v4;
const fs = require('fs');
const path = require('path');

const initSocket = (socket) => {

  let username;
  let userInfo;
  let startTime;
  let endTime;
  const studentChunks = [];
  const tutorChunks = [];

  socket
    .on(SOCKET_EVENTS.INIT, (data) => {
      console.log(data.account.username, "joined")
      username = data.account.username;
      userInfo = data.account;
      onlineUsers.create(socket, data.account);
      socket.emit(SOCKET_EVENTS.GET_ONLINE_TUTORS, { online: onlineUsers.getTutors() });
      socket.emit(SOCKET_EVENTS.INIT, { id: username });
    })
    .on(SOCKET_EVENTS.REQUEST, (data) => {
      const receiver = onlineUsers.getOne(data.to);
      if (receiver && receiver.status !== STATUS.BUSY) {
        onlineUsers.setStatus(username, STATUS.BUSY)
        onlineUsers.setStatus(data.to, STATUS.BUSY);
        receiver.socket.emit(SOCKET_EVENTS.REQUEST, { from: userInfo });
      }
    })
    .on(SOCKET_EVENTS.CALL, (data) => {
      const receiver = onlineUsers.getOne(data.to);
      if (receiver) {
        receiver.socket.emit(SOCKET_EVENTS.CALL, { ...data, from: username });
        startTime = Date.now();
        console.log("Start", username, startTime)
      } else {
        socket.emit(SOCKET_EVENTS.FAILED);
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
    .on(SOCKET_EVENTS.LEAVE, () => {
      onlineUsers.remove(username);
      console.log(username, 'disconnected');
    })
    .on(SOCKET_EVENTS.DISCONNECT, () => {
      onlineUsers.remove(username);
      console.log(username, 'disconnected');
    })
    .on(SOCKET_EVENTS.RECORD_STUDENT, (data) => {
      studentChunks.push(data);
    })
    .on(SOCKET_EVENTS.RECORD_TUTOR, (data) => {
      tutorChunks.push(data);
    })
    .on(SOCKET_EVENTS.SAVE_VIDEOS, async (data) => {
      const callId = uuid();
      const student = data;
      endTime = Date.now();
      duration = endTime - startTime;
      console.log("Duration", duration);
      const studentBuffer = Buffer.concat(studentChunks);
      const tutorBuffer = Buffer.concat(tutorChunks);
      try {
        await CallHistory.create({
          id: callId,
          tutorId: userInfo.tutor.id,
          studentId: student.id,
          duration: duration,
          studentVideo: `/uploads/callHistories/${callId}/student.wemb`,
          tutorVideo: `/uploads/callHistories/${callId}/tutor.wemb`
        });
        const dir = path.resolve(`uploads/callHistories/${callId}`);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(`${dir}/student.webm`, Buffer.from(studentBuffer), { encoding: 'binary' });
        fs.writeFileSync(`${dir}/tutor.webm`, Buffer.from(tutorBuffer), { encoding: 'binary' });
      } catch (error) {
        console.log(error)
      }
    })
  setInterval(() => {
    socket.emit(SOCKET_EVENTS.GET_ONLINE_TUTORS, { online: onlineUsers.getTutors() });
  }, 5000);
}

const checkAuth = (socket, next) => {
  if (socket.handshake.query.token) {
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