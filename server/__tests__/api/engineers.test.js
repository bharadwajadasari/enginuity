import request from 'supertest';
import { app } from '../../index.js';
import { pool } from '../../db.js';

describe('Engineers API', () => {
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

  describe('POST /api/engineers', () => {
    it('creates a new engineer', async () => {
      const response = await request(app)
        .post('/api/engineers')
        .send(testEngineer)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(testEngineer.name);
      expect(response.body.level).toBe(testEngineer.level);
      expect(response.body.department).toBe(testEngineer.department);
      expect(response.body.lastYearRating).toBe(testEngineer.lastYearRating);
    });

    it('returns 400 for invalid engineer data', async () => {
      const invalidEngineer = {
        name: '', // Invalid: empty name
        level: 'L5',
      };

      await request(app)
        .post('/api/engineers')
        .send(invalidEngineer)
        .expect(400);
    });
  });

  describe('GET /api/engineers', () => {
    it('returns all engineers', async () => {
      const response = await request(app)
        .get('/api/engineers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('GET /api/engineers/:id', () => {
    let engineerId;

    beforeEach(async () => {
      // Create a test engineer and store its ID
      const result = await pool.query(
        'INSERT INTO engineers (name, level, department, last_year_rating) VALUES ($1, $2, $3, $4) RETURNING id',
        [testEngineer.name, testEngineer.level, testEngineer.department, testEngineer.lastYearRating]
      );
      engineerId = result.rows[0].id;
    });

    it('returns engineer by id', async () => {
      const response = await request(app)
        .get(`/api/engineers/${engineerId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', engineerId);
      expect(response.body.name).toBe(testEngineer.name);
    });

    it('returns 404 for non-existent engineer', async () => {
      await request(app)
        .get('/api/engineers/999999')
        .expect(404);
    });
  });

  describe('PUT /api/engineers/:id', () => {
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
        ...testEngineer,
        name: 'Updated Engineer',
        level: 'L6',
      };

      const response = await request(app)
        .put(`/api/engineers/${engineerId}`)
        .send(updatedEngineer)
        .expect(200);

      expect(response.body.name).toBe(updatedEngineer.name);
      expect(response.body.level).toBe(updatedEngineer.level);
    });

    it('returns 404 for non-existent engineer', async () => {
      const updatedEngineer = {
        ...testEngineer,
        name: 'Updated Engineer',
      };

      await request(app)
        .put('/api/engineers/999999')
        .send(updatedEngineer)
        .expect(404);
    });
  });

  describe('DELETE /api/engineers/:id', () => {
    let engineerId;

    beforeEach(async () => {
      const result = await pool.query(
        'INSERT INTO engineers (name, level, department, last_year_rating) VALUES ($1, $2, $3, $4) RETURNING id',
        [testEngineer.name, testEngineer.level, testEngineer.department, testEngineer.lastYearRating]
      );
      engineerId = result.rows[0].id;
    });

    it('deletes engineer', async () => {
      await request(app)
        .delete(`/api/engineers/${engineerId}`)
        .expect(204);

      // Verify engineer is deleted
      const response = await request(app)
        .get(`/api/engineers/${engineerId}`)
        .expect(404);
    });

    it('returns 404 for non-existent engineer', async () => {
      await request(app)
        .delete('/api/engineers/999999')
        .expect(404);
    });
  });
}); 