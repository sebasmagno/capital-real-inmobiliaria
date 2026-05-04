import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Asegurar que el directorio de subidas exista en desarrollo
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento local
// En un entorno de producción (ej. process.env.NODE_ENV === 'production'), 
// aquí se usaría multer-s3 o cloudinary-storage.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `property-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen.'));
  }
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitar a 5MB por imagen
    files: 10 // Máximo 10 imágenes por subida
  }
});
