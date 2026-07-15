const { getDb } = require('../config/db');
const { NotFoundError, ConflictError } = require('../utils/errors');

function addFavourite({ name, country, domain, website }) {
  const db = getDb();

  const existing = db
    .prepare('SELECT id FROM favourites WHERE LOWER(name) = LOWER(?) AND LOWER(country) = LOWER(?)')
    .get(name, country);

  if (existing) {
    throw new ConflictError(`"${name}" (${country}) is already in favourites`);
  }

  const result = db
    .prepare(
      'INSERT INTO favourites (name, country, domain, website) VALUES (?, ?, ?, ?)'
    )
    .run(name, country, domain || null, website || null);

  return db.prepare('SELECT * FROM favourites WHERE id = ?').get(result.lastInsertRowid);
}

function getFavourites({ page = 1, limit = 10, sortBy = 'created_at', order = 'DESC' }) {
  const db = getDb();

  const total = db.prepare('SELECT COUNT(*) AS count FROM favourites').get().count;
  const offset = (page - 1) * limit;

  const rows = db
    .prepare(`SELECT * FROM favourites ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`)
    .all(limit, offset);

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

function getFavouriteById(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM favourites WHERE id = ?').get(id);
  if (!row) {
    throw new NotFoundError(`Favourite with id ${id} not found`);
  }
  return row;
}

function deleteFavourite(id) {
  const db = getDb();
  const result = db.prepare('DELETE FROM favourites WHERE id = ?').run(id);
  if (result.changes === 0) {
    throw new NotFoundError(`Favourite with id ${id} not found`);
  }
  return { id };
}

function getSearchHistory({ page = 1, limit = 10 }) {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) AS count FROM search_history').get().count;
  const offset = (page - 1) * limit;
  const rows = db
    .prepare('SELECT * FROM search_history ORDER BY searched_at DESC LIMIT ? OFFSET ?')
    .all(limit, offset);

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

module.exports = {
  addFavourite,
  getFavourites,
  getFavouriteById,
  deleteFavourite,
  getSearchHistory,
};
