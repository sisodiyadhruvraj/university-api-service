const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const logger = require('../utils/logger');

let db = null;

function resolveDbPath() {
  if (process.env.NODE_ENV === 'test') {
    return ':memory:';
  }
  const dbPath = process.env.DB_PATH || './data/university.db';
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  return dbPath;
}

function initDb() {
  if (db) return db;

  const dbPath = resolveDbPath();
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  logger.info(`Database initialized at ${dbPath === ':memory:' ? 'in-memory' : dbPath}`);
  return db;
}

function getDb() {
  if (!db) {
    return initDb();
  }
  return db;
}

function resetDb() {
  const conn = getDb();
  conn.exec('DELETE FROM favourites;');
  conn.exec('DELETE FROM search_history;');
  try {
    conn.exec("DELETE FROM sqlite_sequence WHERE name IN ('favourites','search_history');");
  } catch (err) {
  }
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { initDb, getDb, resetDb, closeDb };
