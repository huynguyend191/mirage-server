const fs = require('fs');
const path = require('path');

const certOptions = {
  key: fs.readFileSync(path.resolve('cert/server.key')),
  cert: fs.readFileSync(path.resolve('cert/server.crt'))
}

module.exports = certOptions;