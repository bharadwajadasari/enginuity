import { pool } from '../../db.js';

describe('Engineers Database Operations', () => {
  const testEngineer = {
    name: 'Test Engineer',
    level: 'L5',
    department: 'Engineering',
    lastYearRating: 'Exceeds',
  };

  beforeAll(async () => {
    // Clear the engineers table before tests
    await pool.query('DELETE FROM engineers');
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('INSERT', () => {
    it('inserts a new engineer', async () => {
      const result = await pool.query(
        'INSERT INTO engineers (name, level, department, last_year_rating) VALUES ($1, $2, $3, $4) RETURNING *',
        [testEngineer.name, testEngineer.level, testEngineer.department, testEngineer.lastYearRating]
      );

      expect(result.rows[0]).toHaveProperty('id');
      expect(result.rows[0].name).toBe(testEngineer.name);
      expect(result.rows[0].level).toBe(testEngineer.level);
      expect(result.rows[0].department).toBe(testEngineer.department);
      expect(result.rows[0].last_year_rating).toBe(testEngineer.lastYearRating);
    });

    it('fails to insert engineer with missing required fields', async () => {
      await expect(
        pool.query(
          'INSERT INTO engineers (name, level) VALUES ($1, $2) RETURNING *',
          [testEngineer.name, testEngineer.level]
        )
      ).rejects.toThrow();
    });
  });

  describe('SELECT', () => {
    let engineerId;

    beforeEach(async () => {
      const result = await pool.query(
        'INSERT INTO engineers (name, level, department, last_year_rating) VALUES ($1, $2, $3, $4) RETURNING id',
        [testEngineer.name, testEngineer.level, testEngineer.department, testEngineer.lastYearRating]
      );
      engineerId = result.rows[0].id;
    });

    it('retrieves all engineers', async () => {
      const result = await pool.query('SELECT * FROM engineers');
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0]).toHaveProperty('id');
      expect(result.rows[0]).toHaveProperty('name');
    });

    it('retrieves engineer by id', async () => {
      const result = await pool.query('SELECT * FROM engineers WHERE id = $1', [engineerId]);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].id).toBe(engineerId);
      expect(result.rows[0].name).toBe(testEngineer.name);
    });

    it('returns empty array for non-existent engineer', async () => {
      const result = await pool.query('SELECT * FROM engineers WHERE id = $1', [999999]);
      expect(result.rows.length).toBe(0);
    });
  });

  describe('UPDATE', () => {
    let engineerId;

    beforeEach(async () => {
      const result = await pool.query(
        'INSERT INTO engineers (name, level, department, last_year_rating) VALUES ($1, $2, $3, $4) RETURNING id',
        [testEngineer.name, testEngineer.level, testEngineer.department, testEngineer.lastYearRating]
      );
      engineerId = result.rows[0].id;
    });

    it('updates engineer information', async () => {
      const updatedEngineer = {
        name: 'Updated Engineer',
        level: 'L6',
      };

      const result = await pool.query(
        'UPDATE engineers SET name = $1, level = $2 WHERE id = $3 RETURNING *',
        [updatedEngineer.name, updatedEngineer.level, engineerId]
      );

      expect(result.rows[0].name).toBe(updatedEngineer.name);
      expect(result.rows[0].level).toBe(updatedEngineer.level);
    });

    it('returns empty array when updating non-existent engineer', async () => {
      const result = await pool.query(
        'UPDATE engineers SET name = $1 WHERE id = $2 RETURNING *',
        ['Updated Name', 999999]
      );
      expect(result.rows.length).toBe(0);
    });
  });

  describe('DELETE', () => {
    let engineerId;

    beforeEach(async () => {
      const result = await pool.query(
        'INSERT INTO engineers (name, level, department, last_year_rating) VALUES ($1, $2, $3, $4) RETURNING id',
        [testEngineer.name, testEngineer.level, testEngineer.department, testEngineer.lastYearRating]
      );
      engineerId = result.rows[0].id;
    });

    it('deletes engineer', async () => {
      const result = await pool.query('DELETE FROM engineers WHERE id = $1 RETURNING *', [engineerId]);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].id).toBe(engineerId);

      // Verify engineer is deleted
      const verifyResult = await pool.query('SELECT * FROM engineers WHERE id = $1', [engineerId]);
      expect(verifyResult.rows.length).toBe(0);
    });

    it('returns empty array when deleting non-existent engineer', async () => {
      const result = await pool.query('DELETE FROM engineers WHERE id = $1 RETURNING *', [999999]);
      expect(result.rows.length).toBe(0);
    });
  });
}); 