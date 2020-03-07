const jwt = require('jsonwebtoken');
const msg =  require('../lib/constants/messages');

module.exports = (role) => {
  return (req, res, next) => {
    try {
      if (req.cookies.access_token) {
        const decoded = jwt.verify(req.cookies.access_token, process.env.JWT_KEY);
        req.role = decoded.role;
        req.username = decoded.username;
        if (role && req.role > role) {
          return res.status(403).json({
            message: msg.MSG_FORBIDDEN
          });
        }
        next();
      } else {
        return res.status(401).json({
          message: msg.MSG_UNAUTHORIZED
        });
      }
    } catch (error) {
      return res.status(401).json({
        message: msg.MSG_UNAUTHORIZED
      });
    }
  }
}