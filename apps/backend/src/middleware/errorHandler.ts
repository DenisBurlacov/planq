import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    logger.warn({ code: err.code, message: err.message, requestId });
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      statusCode: err.statusCode,
      requestId,
    });
    return;
  }

  logger.error({ message: err.message, stack: err.stack, requestId });
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Internal server error',
    statusCode: 500,
    requestId,
  });
}
