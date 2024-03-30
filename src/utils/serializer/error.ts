import { Logger } from '@nestjs/common';

const logger = new Logger();

export const formatErrorResponse = (error: Error, ip: string) => {
  logger.error(`Error processing IP: ${ip}, Error: ${error.name}`);
  return {
    status: "fail",
    message: error.name,
    query: ip
  };
};