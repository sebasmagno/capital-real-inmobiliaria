import multer from 'multer';

/**
 * Usamos MemoryStorage para que el archivo esté disponible en buffer
 * Esto permite subirlo directamente a Supabase Storage sin guardarlo localmente.
 */
const storage = multer.memoryStorage();

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
