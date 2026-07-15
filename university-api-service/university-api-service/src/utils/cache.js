class TtlCache {
  constructor(ttlMs = 300000) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  _isExpired(entry) {
    return Date.now() > entry.expiresAt;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (this._isExpired(entry)) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs = this.ttlMs) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

module.exports = new TtlCache(Number(process.env.CACHE_TTL_MS) || 300000);
module.exports.TtlCache = TtlCache;
