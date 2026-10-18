import { Router } from 'express';
import { createLead } from '../controllers/leadController';

const router = Router();

// Ruta pública para registrar consultas y solicitudes de visita
router.post('/', createLead);

export default router;
