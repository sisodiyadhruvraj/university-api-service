process.env.NODE_ENV = 'test';

jest.mock('axios', () => ({
  create: jest.fn(() => ({ get: jest.fn() })),
}));

const request = require('supertest');
const createApp = require('../../src/app');
const { initDb, resetDb, closeDb } = require('../../src/config/db');

let app;

beforeAll(() => {
  initDb();
  app = createApp();
});

afterEach(() => {
  resetDb();
});

afterAll(() => {
  closeDb();
});

describe('POST /api/favourites', () => {
  test('201: creates a favourite', async () => {
    const res = await request(app)
      .post('/api/favourites')
      .send({ name: 'Indian Institute of Technology Delhi', country: 'India' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Indian Institute of Technology Delhi');
  });

  test('400: missing name', async () => {
    const res = await request(app).post('/api/favourites').send({ country: 'India' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  test('400: missing country', async () => {
    const res = await request(app).post('/api/favourites').send({ name: 'MIT' });
    expect(res.status).toBe(400);
  });

  test('409: duplicate favourite', async () => {
    await request(app).post('/api/favourites').send({ name: 'MIT', country: 'USA' });

    const res = await request(app).post('/api/favourites').send({ name: 'MIT', country: 'USA' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('ConflictError');
  });
});

describe('GET /api/favourites', () => {
  test('200: empty list when no favourites exist', async () => {
    const res = await request(app).get('/api/favourites');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  test('200: returns saved favourites with pagination metadata', async () => {
    await request(app).post('/api/favourites').send({ name: 'MIT', country: 'USA' });
    await request(app).post('/api/favourites').send({ name: 'Oxford', country: 'UK' });

    const res = await request(app).get('/api/favourites').query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
  });

  test('200: sorts by name ascending', async () => {
    await request(app).post('/api/favourites').send({ name: 'Zeta University', country: 'USA' });
    await request(app).post('/api/favourites').send({ name: 'Alpha University', country: 'USA' });

    const res = await request(app)
      .get('/api/favourites')
      .query({ sortBy: 'name', order: 'asc' });

    expect(res.body.data.map((f) => f.name)).toEqual(['Alpha University', 'Zeta University']);
  });

  test('400: invalid pagination params', async () => {
    const res = await request(app).get('/api/favourites').query({ limit: 500 });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/favourites/:id', () => {
  test('200: deletes an existing favourite', async () => {
    const created = await request(app)
      .post('/api/favourites')
      .send({ name: 'MIT', country: 'USA' });

    const res = await request(app).delete(`/api/favourites/${created.body.id}`);

    expect(res.status).toBe(200);

    const listRes = await request(app).get('/api/favourites');
    expect(listRes.body.data).toHaveLength(0);
  });

  test('404: deleting a non-existent id', async () => {
    const res = await request(app).delete('/api/favourites/999999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NotFoundError');
  });

  test('400: invalid (non-numeric) id', async () => {
    const res = await request(app).delete('/api/favourites/not-a-number');
    expect(res.status).toBe(400);
  });
});
