import express from 'express';
import { pool } from '../db/index.js';

const router = express.Router();

// Get all engineers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM engineers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching engineers:', error);
    res.status(500).json({ message: 'Error fetching engineers' });
  }
});

// Get a single engineer
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM engineers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Engineer not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching engineer:', error);
    res.status(500).json({ message: 'Error fetching engineer' });
  }
});

// Create a new engineer
router.post('/', async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    current_role,
    current_level,
    department,
    start_date,
    time_in_role,
    last_year_rating
  } = req.body;

  try {
    // Check if email already exists
    const emailCheck = await pool.query('SELECT id FROM engineers WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const result = await pool.query(
      `INSERT INTO engineers (
        first_name, last_name, email, "current_role", "current_level",
        department, start_date, time_in_role, last_year_rating
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        first_name, last_name, email, current_role, current_level,
        department, start_date, time_in_role, last_year_rating
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating engineer:', error);
    res.status(500).json({ message: 'Error creating engineer' });
  }
});

export default router; 