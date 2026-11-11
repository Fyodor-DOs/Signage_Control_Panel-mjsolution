import { Router } from 'express';
import { login } from '../controllers/authController';

const router = Router();

// POST /api/auth/login — no auth middleware required
router.post('/login', login);

export default router;
