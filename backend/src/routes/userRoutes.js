import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { findUserBalanceByUsername } from '../repositories/userRepository.js';

const router = express.Router();

// Get balance endpoint (protected)
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const balance = await findUserBalanceByUsername(username);

    if (balance === null) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balance });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
