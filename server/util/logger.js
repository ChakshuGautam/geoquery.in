import winston from 'winston';

class Logger {
    constructor() {
        // Define the minimum log level depending on the environment
        const level = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

        // Define log format
        const format = winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        );

        // Winston logger
        this.logger = winston.createLogger({
            level: level,
            format: format,
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' })
            ]
        });
    }

    debug(message) {
        this.logger.debug(message);
    }

    info(message) {
        this.logger.info(message);
    }

    warn(message) {
        this.logger.warn(message);
    }

    error(message) {
        this.logger.error(message);
    }
}

export default Logger;
