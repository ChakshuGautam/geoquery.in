const winston = require('winston');

class Logger {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
  }

  debug(message) {
    // To Omit debug logs in production
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(message);
    }
  }

  info(message) {
    // Omit info logs in production
    if (process.env.NODE_ENV !== 'production') {
      this.logger.info(message);
    }
  }

  warn(message) {
    this.logger.warn(message);
  }

  error(message) {
    this.logger.error(message);
  }
}

module.exports = new Logger();
