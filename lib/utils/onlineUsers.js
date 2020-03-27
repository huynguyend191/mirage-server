exports.onlineUsersList = {};

exports.createUser = (socket, username) => {
  this.onlineUsersList[username] = socket;
  return username;
};

exports.getUser = username => this.onlineUsersList[username];

exports.removeUser = username => delete this.onlineUsersList[username];

