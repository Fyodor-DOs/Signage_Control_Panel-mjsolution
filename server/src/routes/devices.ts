import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  attachContent,
} from '../controllers/deviceController';

const router = Router();

// All device routes require a valid JWT
router.use(authMiddleware);

router.get('/', getDevices);
router.get('/:id', getDevice);
router.post('/', createDevice);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);
router.put('/:id/content', attachContent);

export default router;
