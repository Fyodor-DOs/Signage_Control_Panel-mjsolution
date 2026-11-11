import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import {
  getContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  uploadFile,
} from '../controllers/contentController';

const router = Router();

// All content routes require a valid JWT
router.use(authMiddleware);

router.get('/', getContents);
// /upload must come before /:id so it is not caught by the param route
router.post('/upload', uploadMiddleware, uploadFile);
router.post('/', createContent);
router.get('/:id', getContent);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router;
