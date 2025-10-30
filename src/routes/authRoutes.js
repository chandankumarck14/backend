import express from 'express';
import {
  signup,
  login,
  validateToken,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/validate', authenticateToken, validateToken);

export default router;
