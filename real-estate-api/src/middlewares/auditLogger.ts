import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = (req as any).user?.id || 'Anonymous';
    
    logger.info(`Audit Log: ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userId
    });
  });

  next();
};
