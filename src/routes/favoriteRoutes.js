import express from 'express';
import {
  createFavorite,
  getFavorites,
  updateFavorite,
  deleteFavorite,
} from '../controllers/favoriteController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, createFavorite);
router.get('/', authenticateToken, getFavorites);
router.put('/:id', authenticateToken, updateFavorite);
router.delete('/:id', authenticateToken, deleteFavorite);

export default router;
