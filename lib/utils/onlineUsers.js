const { STATUS } = require('../constants/account');
exports.onlineUsersList = {};

exports.create = (socket, account) => {
  if (!this.onlineUsersList[account.username]) {
    this.onlineUsersList[account.username] = {
      socket,
      status: STATUS.AVAILABLE,
      role: account.role,
      profile: account.tutor ? account.tutor : null
    };
  }
};

exports.setStatus = (username, status) => {
  this.onlineUsersList[username].status = status;
};

exports.getOne = username => this.onlineUsersList[username];

exports.remove = username => delete this.onlineUsersList[username];

exports.getAll = () => Object.keys(this.onlineUsersList);

