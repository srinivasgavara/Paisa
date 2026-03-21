const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const XLSX = require('xlsx');

// All routes require authentication
router.use(authMiddleware);

// GET /api/expenses - Get all expenses with optional filters
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, category, filter, startDate, endDate, sortBy = 'date', sortOrder = 'DESC' } = req.query;

    let query = `SELECT * FROM expenses WHERE user_id = $1`;
    const params = [userId];
    let paramIdx = 2;

    // Date filters
    if (filter === 'today') {
      query += ` AND date = CURRENT_DATE`;
    } else if (filter === 'week') {
      query += ` AND date >= date_trunc('week', CURRENT_DATE)`;
    } else if (filter === 'month') {
      query += ` AND date >= date_trunc('month', CURRENT_DATE)`;
    } else if (filter === 'custom' && startDate && endDate) {
      query += ` AND date BETWEEN $${paramIdx} AND $${paramIdx + 1}`;
      params.push(startDate, endDate);
      paramIdx += 2;
    }

    // Search
    if (search) {
      query += ` AND (description ILIKE $${paramIdx} OR category ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    // Category filter
    if (category && category !== 'all') {
      query += ` AND category = $${paramIdx}`;
      params.push(category);
      paramIdx++;
    }

    // Sorting - whitelist columns
    const allowedSort = ['date', 'amount', 'category', 'description', 'created_at'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'date';
    const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${safeSort} ${safeOrder}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/expenses - Add new expense
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, category, description, amount } = req.body;

    if (!date || !category || !description || !amount) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const result = await pool.query(
      `INSERT INTO expenses (user_id, date, category, description, amount)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, date, category, description, parseFloat(amount)]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// PUT /api/expenses/:id - Update expense
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { date, category, description, amount } = req.body;

    if (!date || !category || !description || !amount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await pool.query(
      `UPDATE expenses SET date=$1, category=$2, description=$3, amount=$4
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [date, category, description, parseFloat(amount), id, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM expenses WHERE id=$1 AND user_id=$2 RETURNING id',
      [id, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// GET /api/expenses/stats/dashboard - Dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    // Today's total
    const todayResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
       FROM expenses WHERE user_id=$1 AND date=CURRENT_DATE`,
      [userId]
    );

    // This month's total and average
    const monthResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
       FROM expenses WHERE user_id=$1 AND date_trunc('month', date)=date_trunc('month', CURRENT_DATE)`,
      [userId]
    );

    // Daily spending this month (for bar chart)
    const dailyResult = await pool.query(
      `SELECT date, SUM(amount) as total
       FROM expenses WHERE user_id=$1
       AND date_trunc('month', date)=date_trunc('month', CURRENT_DATE)
       GROUP BY date ORDER BY date ASC`,
      [userId]
    );

    // Monthly trend (last 6 months, for line chart)
    const trendResult = await pool.query(
      `SELECT to_char(date_trunc('month', date), 'Mon YYYY') as month,
              date_trunc('month', date) as month_date,
              SUM(amount) as total
       FROM expenses WHERE user_id=$1
       AND date >= NOW() - INTERVAL '6 months'
       GROUP BY date_trunc('month', date) ORDER BY month_date ASC`,
      [userId]
    );

    // Category breakdown (for pie chart)
    const categoryResult = await pool.query(
      `SELECT category, SUM(amount) as total
       FROM expenses WHERE user_id=$1
       AND date_trunc('month', date)=date_trunc('month', CURRENT_DATE)
       GROUP BY category ORDER BY total DESC`,
      [userId]
    );

    // Today's expenses list
    const todayExpenses = await pool.query(
      `SELECT * FROM expenses WHERE user_id=$1 AND date=CURRENT_DATE ORDER BY created_at DESC`,
      [userId]
    );

    const monthCount = parseInt(monthResult.rows[0].count);
    const monthTotal = parseFloat(monthResult.rows[0].total);

    // Calculate days in current month so far
    const daysInMonth = new Date().getDate();
    const avgDaily = monthCount > 0 ? monthTotal / daysInMonth : 0;

    res.json({
      today: {
        total: parseFloat(todayResult.rows[0].total),
        count: parseInt(todayResult.rows[0].count),
        expenses: todayExpenses.rows,
      },
      month: {
        total: monthTotal,
        count: monthCount,
        avgDaily: parseFloat(avgDaily.toFixed(2)),
      },
      charts: {
        daily: dailyResult.rows,
        trend: trendResult.rows,
        categories: categoryResult.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/expenses/export - Export to Excel
router.get('/export', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT date, category, description, amount FROM expenses
       WHERE user_id=$1 ORDER BY date DESC`,
      [userId]
    );

    const data = result.rows.map((row) => ({
      Date: row.date,
      Category: row.category,
      Description: row.description,
      Amount: parseFloat(row.amount),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Column widths
    ws['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 35 }, { wch: 12 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="expenses.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export expenses' });
  }
});

// GET /api/expenses/categories - Get all unique categories
router.get('/categories', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT DISTINCT category FROM expenses WHERE user_id=$1 ORDER BY category',
      [userId]
    );
    res.json(result.rows.map((r) => r.category));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
