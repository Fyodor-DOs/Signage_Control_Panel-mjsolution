import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getPlaylist,
  addPlaylistItem,
  updatePlaylistItem,
  removePlaylistItem,
} from '../controllers/playlistController';

const router = Router({ mergeParams: true }); // agar :id dari parent tersedia

router.use(authMiddleware);

router.get('/', getPlaylist);
router.post('/', addPlaylistItem);
router.put('/:itemId', updatePlaylistItem);
router.delete('/:itemId', removePlaylistItem);

export default router;

