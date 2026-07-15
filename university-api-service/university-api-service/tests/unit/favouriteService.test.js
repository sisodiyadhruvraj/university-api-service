process.env.NODE_ENV = 'test';

const { initDb, resetDb, closeDb } = require('../../src/config/db');
const favouriteService = require('../../src/services/favouriteService');
const { NotFoundError, ConflictError } = require('../../src/utils/errors');

beforeAll(() => {
  initDb();
});

afterEach(() => {
  resetDb();
});

afterAll(() => {
  closeDb();
});

describe('favouriteService.addFavourite', () => {
  test('creates a new favourite', () => {
    const fav = favouriteService.addFavourite({
      name: 'MIT',
      country: 'USA',
      domain: 'mit.edu',
      website: 'https://mit.edu',
    });

    expect(fav.id).toBeDefined();
    expect(fav.name).toBe('MIT');
    expect(fav.country).toBe('USA');
    expect(fav.domain).toBe('mit.edu');
  });

  test('throws ConflictError on duplicate name+country', () => {
    favouriteService.addFavourite({ name: 'MIT', country: 'USA' });

    expect(() => favouriteService.addFavourite({ name: 'MIT', country: 'USA' })).toThrow(
      ConflictError
    );
  });

  test('duplicate check is case-insensitive', () => {
    favouriteService.addFavourite({ name: 'MIT', country: 'USA' });

    expect(() => favouriteService.addFavourite({ name: 'mit', country: 'usa' })).toThrow(
      ConflictError
    );
  });

  test('allows the same name in a different country', () => {
    favouriteService.addFavourite({ name: 'Central University', country: 'USA' });
    const second = favouriteService.addFavourite({ name: 'Central University', country: 'India' });
    expect(second.country).toBe('India');
  });
});

describe('favouriteService.getFavourites', () => {
  beforeEach(() => {
    favouriteService.addFavourite({ name: 'Alpha University', country: 'USA' });
    favouriteService.addFavourite({ name: 'Beta University', country: 'India' });
    favouriteService.addFavourite({ name: 'Gamma University', country: 'UK' });
  });

  test('returns all rows within default pagination', () => {
    const result = favouriteService.getFavourites({ page: 1, limit: 10, sortBy: 'created_at', order: 'DESC' });
    expect(result.data).toHaveLength(3);
    expect(result.pagination.total).toBe(3);
  });

  test('paginates results', () => {
    const page1 = favouriteService.getFavourites({ page: 1, limit: 2, sortBy: 'created_at', order: 'DESC' });
    const page2 = favouriteService.getFavourites({ page: 2, limit: 2, sortBy: 'created_at', order: 'DESC' });

    expect(page1.data).toHaveLength(2);
    expect(page2.data).toHaveLength(1);
    expect(page1.pagination.totalPages).toBe(2);
  });

  test('sorts by name ascending', () => {
    const result = favouriteService.getFavourites({ page: 1, limit: 10, sortBy: 'name', order: 'ASC' });
    const names = result.data.map((r) => r.name);
    expect(names).toEqual(['Alpha University', 'Beta University', 'Gamma University']);
  });

  test('returns an empty result set with correct pagination metadata when there is nothing to show', () => {
    resetDb();
    const result = favouriteService.getFavourites({ page: 1, limit: 10, sortBy: 'created_at', order: 'DESC' });
    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });
});

describe('favouriteService.deleteFavourite', () => {
  test('deletes an existing favourite', () => {
    const fav = favouriteService.addFavourite({ name: 'MIT', country: 'USA' });
    const result = favouriteService.deleteFavourite(fav.id);
    expect(result.id).toBe(fav.id);
    expect(() => favouriteService.getFavouriteById(fav.id)).toThrow(NotFoundError);
  });

  test('throws NotFoundError for a non-existent id', () => {
    expect(() => favouriteService.deleteFavourite(99999)).toThrow(NotFoundError);
  });
});
