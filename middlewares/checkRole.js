const msg = require('../lib/constants/messages');

module.exports = (role) => {
  return (req, res, next) => {
    if (req.role != role) {
      return res.status(403).json({
        message: msg.MSG_FORBIDDEN
      });
    }
    next();
  }
}