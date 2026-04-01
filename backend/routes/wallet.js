const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/wallet
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT balance FROM wallet WHERE user_id = $1',
      [req.user.id]
    );
    const balance = result.rows.length ? parseFloat(result.rows[0].balance) : 0;
    res.json({ balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// PUT /api/wallet
router.put('/', async (req, res) => {
  try {
    const { balance } = req.body;
    if (isNaN(balance) || balance < 0) {
      return res.status(400).json({ error: 'Invalid balance amount' });
    }
    const result = await pool.query(
      `INSERT INTO wallet (user_id, balance)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET balance = EXCLUDED.balance, updated_at = NOW()
       RETURNING balance`,
      [req.user.id, parseFloat(balance)]
    );
    res.json({ balance: parseFloat(result.rows[0].balance) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update wallet' });
  }
});

module.exports = router;
