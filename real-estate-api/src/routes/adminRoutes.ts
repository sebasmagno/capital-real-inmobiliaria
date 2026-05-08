import { Router } from 'express';
import { login } from '../controllers/authController';
import { createProperty, deleteProperty, updateProperty } from '../controllers/propertyController';
import { getDashboardStats } from '../controllers/adminController';
import { getUsers, createUser, deleteUser, getPublicAgents, getUserById, updateUser } from '../controllers/userController';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { requireAuth, isAdmin } from '../middlewares/authMiddleware';
import { uploadImages } from '../middlewares/multerMiddleware';

const router = Router();

// Endpoint público para la configuración de la empresa
router.get('/settings/public', getSettings);

// Endpoint público para que los administradores inicien sesión
router.post('/login', login);

// Endpoint público para obtener agentes
router.get('/public-agents', getPublicAgents);

// Todos los endpoints debajo de esta línea requieren un JWT válido
router.use(requireAuth);

// Estadísticas del Dashboard
router.get('/stats', getDashboardStats);

// Gestión de Usuarios (Agentes) - Solo Admin puede crear/borrar
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', isAdmin, uploadImages.single('image'), createUser);
router.put('/users/:id', updateUser); // El propio usuario puede editarse, o el admin
router.delete('/users/:id', isAdmin, deleteUser);

// Gestión de propiedades
router.post('/properties', uploadImages.array('images', 10), createProperty);
router.put('/properties/:id', uploadImages.array('images', 10), updateProperty);
router.delete('/properties/:id', isAdmin, deleteProperty);

// Configuración de la empresa - Solo Admin
router.get('/settings', getSettings);
router.put('/settings', isAdmin, uploadImages.single('logo'), updateSettings);

export default router;
