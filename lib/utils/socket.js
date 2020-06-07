const io = require('socket.io');
const SOCKET_EVENTS = require('../constants/socketEvents');
const jwt = require('jsonwebtoken');
const onlineUsers = require('../utils/onlineUsers');
const { STATUS } = require('../constants/account');
const { HISTORY_COUNT } = require('../constants/payment');
const CallHistory = require('../../models/CallHistory');
const Student = require('../../models/Student');
const uuid = require('uuid').v4;
const fs = require('fs');
const path = require('path');

const initSocket = socket => {
  let username;
  let userInfo;
  let startTime;
  let endTime;
  let studentFs;
  let tutorFs;
  let callId;

  socket
    .on(SOCKET_EVENTS.INIT, data => {
      console.log(data.account.username, 'joined');
      username = data.account.username;
      userInfo = data.account;
      onlineUsers.create(socket, data.account);
      socket.emit(SOCKET_EVENTS.GET_ONLINE_TUTORS, { online: onlineUsers.getTutors() });
      socket.emit(SOCKET_EVENTS.INIT, { id: username });
    })
    .on(SOCKET_EVENTS.REQUEST, data => {
      const receiver = onlineUsers.getOne(data.to);
      if (receiver && receiver.status !== STATUS.BUSY) {
        onlineUsers.setStatus(username, STATUS.BUSY);
        onlineUsers.setStatus(data.to, STATUS.BUSY);
        receiver.socket.emit(SOCKET_EVENTS.REQUEST, { from: userInfo });
      }
    })
    .on(SOCKET_EVENTS.CALL, data => {
      const receiver = onlineUsers.getOne(data.to);
      if (receiver) {
        receiver.socket.emit(SOCKET_EVENTS.CALL, { ...data, from: username });
        startTime = Date.now();
        console.log('Start', username, startTime);
      } else {
        socket.emit(SOCKET_EVENTS.FAILED);
      }
    })
    .on(SOCKET_EVENTS.END, data => {
      const receiver = onlineUsers.getOne(data.to);
      if (receiver) {
        student = receiver.profile;
        onlineUsers.setStatus(username, STATUS.AVAILABLE);
        onlineUsers.setStatus(data.to, STATUS.AVAILABLE);
        receiver.socket.emit(SOCKET_EVENTS.END);
      }
    })
    .on(SOCKET_EVENTS.CREATE_CALL_HISTORY, async data => {
      endTime = Date.now();
      duration = endTime - startTime;
      console.log('Duration', duration);
      try {
        CallHistory.create({
          id: callId,
          tutorId: userInfo.tutor.id,
          studentId: data.id,
          duration: duration,
          counted: HISTORY_COUNT.UNCOUNTED
        });
        const studentData = await Student.findOne({
          where: { id: data.id }
        });
        const newTime = studentData.remaining_time - duration;
        if (newTime < 0) {
          newTime = 0;
        }
        Student.update(
          {
            remaining_time: newTime
          },
          {
            where: {
              id: studentData.id
            }
          }
        );
      } catch (error) {
        console.log(error);
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
    .on(SOCKET_EVENTS.SAVE_VIDEOS, () => {
      callId = uuid();
      const dir = path.resolve(`uploads/callHistories/${callId}`);
      fs.mkdirSync(dir, { recursive: true });
      studentFs = fs.createWriteStream(`${dir}/student.webm`, { flags: 'a' });
      tutorFs = fs.createWriteStream(`${dir}/tutor.webm`, { flags: 'a' });
    })
    .on(SOCKET_EVENTS.RECORD_STUDENT, data => {
      studentFs.write(data);
    })
    .on(SOCKET_EVENTS.RECORD_TUTOR, data => {
      tutorFs.write(data);
    });

  setInterval(() => {
    socket.emit(SOCKET_EVENTS.GET_ONLINE_TUTORS, { online: onlineUsers.getTutors() });
  }, 5000);
  setInterval(() => {
    socket.emit(SOCKET_EVENTS.GET_ONLINE_STUDENTS, { online: onlineUsers.getStudents() });
  }, 5000);
};

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
};

module.exports = server => {
  io.listen(server, { log: true }).use(checkAuth).on(SOCKET_EVENTS.CONNECTION, initSocket);
};
