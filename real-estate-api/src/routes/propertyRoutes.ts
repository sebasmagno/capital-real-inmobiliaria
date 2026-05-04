import { Router } from 'express';
import { getProperties, getPropertyById } from '../controllers/propertyController';

const router = Router();

// Rutas públicas (No requieren JWT)
router.get('/', getProperties);
router.get('/:id', getPropertyById);

export default router;
