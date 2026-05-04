import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error no manejado: ${err.message}`, { 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  // Si es un error de JWT
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ success: false, error: 'Token inválido o expirado.', code: 'AUTH_INVALID_TOKEN' });
  }

  // Errores controlados personalizados
  if (err.statusCode) {
    return res.status(err.statusCode).json({ success: false, error: err.message, code: err.errorCode || 'APP_ERROR' });
  }

  // Error genérico para el cliente (No exponer stack traces en prod)
  res.status(500).json({ 
    success: false, 
    error: 'Ocurrió un error interno en el servidor.', 
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
};
