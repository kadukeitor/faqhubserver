var fs = require('fs'), configurationFile = './config/config.json';

module.exports = JSON.parse(
    fs.readFileSync(configurationFile)
);