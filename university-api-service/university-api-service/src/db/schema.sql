CREATE TABLE IF NOT EXISTS favourites (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  country    TEXT NOT NULL,
  domain     TEXT,
  website    TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (name, country)
);

CREATE TABLE IF NOT EXISTS search_history (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  country      TEXT,
  name         TEXT,
  result_count INTEGER NOT NULL DEFAULT 0,
  searched_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_favourites_country ON favourites (country);
CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON search_history (searched_at);
