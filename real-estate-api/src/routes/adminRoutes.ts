import { Router } from 'express';
import { login } from '../controllers/authController';
import { createProperty, deleteProperty, updateProperty } from '../controllers/propertyController';
import { requireAuth } from '../middlewares/authMiddleware';
import { uploadImages } from '../middlewares/multerMiddleware';

const router = Router();

// Endpoint público para que los administradores inicien sesión
router.post('/login', login);

// Todos los endpoints debajo de esta línea requieren un JWT válido
router.use(requireAuth);

// Gestión de propiedades
router.post('/properties', uploadImages.array('images', 10), createProperty);
router.put('/properties/:id', uploadImages.array('images', 10), updateProperty);
router.delete('/properties/:id', deleteProperty);

export default router;
