import 'dotenv/config';
import 'express-async-errors'; // Maneja automáticamente promesas rechazadas en los controladores
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

import { errorHandler } from './middlewares/errorHandler';
import { auditLogger } from './middlewares/auditLogger';

// Routes imports
import propertyRoutes from './routes/propertyRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auditoría y Logging (Morgan y Winston combo)
app.use(morgan('dev'));
app.use(auditLogger);

// Servir imágenes localmente en desarrollo
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Salud del sistema
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas de negocio
app.use('/api/properties', propertyRoutes); // Públicas
app.use('/api/admin', adminRoutes);         // Protegidas (Requieren JWT)

// Manejador global de errores (Siempre va al final)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});
