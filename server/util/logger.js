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

    debug(className, message) {
        this.logger.debug(`[${className}] ${message}`);
    }

    info(className, message) {
        this.logger.info(`[${className}] ${message}`);
    }

    warn(className, message) {
        this.logger.warn(`[${className}] ${message}`);
    }

    error(className, message) {
        this.logger.error(`[${className}] ${message}`);
    }
}

export default Logger;
