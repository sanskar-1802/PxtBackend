const logger = require('../utils/logger');
exports.errorHandler = (err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
};
