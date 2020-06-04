const { STATUS, ROLES } = require('../constants/account');
exports.onlineUsersList = {};

exports.create = (socket, account) => {
  if (!this.onlineUsersList[account.username]) {
    this.onlineUsersList[account.username] = {
      socket,
      status: STATUS.AVAILABLE,
      role: account.role,
      profile: account.tutor ? account.tutor : account.student
    };
  }
};

exports.setStatus = (username, status) => {
  this.onlineUsersList[username].status = status;
};

exports.getOne = username => this.onlineUsersList[username];

exports.remove = username => delete this.onlineUsersList[username];

exports.getTutors = () => {
  const tutors = [];
  for (user in this.onlineUsersList) {
    if (this.onlineUsersList[user].role === ROLES.TUTOR) {
      tutors.push({
        profile: this.onlineUsersList[user].profile,
        username: user,
        status: this.onlineUsersList[user].status
      });
    }
  }
  return tutors;
};

exports.getStudents = () => {
  const students = [];
  for (user in this.onlineUsersList) {
    if (this.onlineUsersList[user].role === ROLES.STUDENT) {
      students.push({
        profile: this.onlineUsersList[user].profile,
        username: user
      });
    }
  }
  return students;
  b;
};
