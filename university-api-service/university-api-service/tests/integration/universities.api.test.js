process.env.NODE_ENV = 'test';

const mockGet = jest.fn();

jest.mock('axios', () => ({
  create: jest.fn(() => ({ get: (...args) => mockGet(...args) })),
}));

const request = require('supertest');
const createApp = require('../../src/app');
const { initDb, closeDb } = require('../../src/config/db');
const cache = require('../../src/utils/cache');

const RAW_SAMPLE = [
  {
    name: 'Indian Institute of Technology Delhi',
    country: 'India',
    domains: ['iitd.ac.in'],
    web_pages: ['http://www.iitd.ac.in'],
  },
];

let app;

beforeAll(() => {
  initDb();
  app = createApp();
});

afterAll(() => {
  closeDb();
});

beforeEach(() => {
  mockGet.mockReset();
  cache.clear();
});

describe('GET /api/universities', () => {
  test('200: returns universities for a valid country', async () => {
    mockGet.mockResolvedValue({ data: RAW_SAMPLE });

    const res = await request(app).get('/api/universities').query({ country: 'India' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toEqual({
      name: 'Indian Institute of Technology Delhi',
      country: 'India',
      domain: 'iitd.ac.in',
      website: 'http://www.iitd.ac.in',
    });
  });

  test('200: filters by name as well as country', async () => {
    mockGet.mockResolvedValue({ data: RAW_SAMPLE });

    const res = await request(app)
      .get('/api/universities')
      .query({ country: 'India', name: 'Delhi' });

    expect(res.status).toBe(200);
    expect(mockGet).toHaveBeenCalledWith('/search', {
      params: { country: 'India', name: 'Delhi' },
    });
  });

  test('400: missing country returns a validation error', async () => {
    const res = await request(app).get('/api/universities');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  test('200: returns an empty array for a country with no matches', async () => {
    mockGet.mockResolvedValue({ data: [] });

    const res = await request(app).get('/api/universities').query({ country: 'Atlantis' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('503: external API unavailable', async () => {
    mockGet.mockRejectedValue(new Error('connect ECONNREFUSED'));

    const res = await request(app).get('/api/universities').query({ country: 'India' });

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('ServiceUnavailableError');
  });

  test('503: external API timeout', async () => {
    const timeoutError = new Error('timeout of 5000ms exceeded');
    timeoutError.code = 'ECONNABORTED';
    mockGet.mockRejectedValue(timeoutError);

    const res = await request(app).get('/api/universities').query({ country: 'India' });

    expect(res.status).toBe(503);
  });
});

describe('GET /api/universities/:name', () => {
  test('200: returns details for an exact match', async () => {
    mockGet.mockResolvedValue({ data: RAW_SAMPLE });

    const res = await request(app).get(
      '/api/universities/Indian%20Institute%20of%20Technology%20Delhi'
    );

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Indian Institute of Technology Delhi');
  });

  test('404: no matching university', async () => {
    mockGet.mockResolvedValue({ data: [] });

    const res = await request(app).get('/api/universities/Nonexistent%20University');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NotFoundError');
  });
});

describe('Invalid endpoint', () => {
  test('404: unknown route', async () => {
    const res = await request(app).get('/api/not-a-real-route');
    expect(res.status).toBe(404);
  });
});
