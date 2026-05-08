import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Acceso denegado. Token no proporcionado.', code: 'AUTH_MISSING_TOKEN' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'secret';
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded; // Adjuntar payload al request para uso posterior
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token inválido o expirado.', code: 'AUTH_INVALID_TOKEN' });
  }
};
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user && user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
};
