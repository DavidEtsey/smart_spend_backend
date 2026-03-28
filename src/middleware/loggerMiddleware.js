const morgan = require("morgan");

// Use 'dev' format (gives method, url, status, response time)
const logger = morgan("dev");

module.exports = logger;