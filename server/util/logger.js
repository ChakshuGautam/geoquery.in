import winston from "winston";

class Logger {
  constructor(fileName) {
    // Define the minimum log level depending on the environment
    const level = process.env.NODE_ENV === "production" ? "warn" : "debug";

    // Define log format
    const format = winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    );

    // Define Winston logger
    this.logger = winston.createLogger({
      level: level,
      format: format,
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
      ],
    });
    // Store the file name for logger
    this.fileName = fileName;
  }

  log(level, message) {
    // Log the message with the stored file name
    this.logger.log(level, `[${this.fileName}] ${message}`);
  }

  // Update other methods to use log method
  debug(message) {
        this.log('debug', message);
    }

    info(message) {
        this.log('info', message);
    }

    warn(message) {
        this.log('warn', message);
    }

    error(message) {
        this.log('error', message);
    }
}

export default Logger;
