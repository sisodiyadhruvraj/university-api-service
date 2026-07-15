const axios = require('axios');
const cache = require('../utils/cache');
const logger = require('../utils/logger');
const { NotFoundError, ServiceUnavailableError } = require('../utils/errors');
const { getDb } = require('../config/db');

const BASE_URL = process.env.UNIVERSITIES_API_URL || 'http://universities.hipolabs.com';
const TIMEOUT_MS = Number(process.env.EXTERNAL_API_TIMEOUT_MS) || 5000;

const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
});

function mapUniversity(raw) {
  return {
    name: raw.name,
    country: raw.country,
    domain: Array.isArray(raw.domains) && raw.domains.length > 0 ? raw.domains[0] : null,
    website: Array.isArray(raw.web_pages) && raw.web_pages.length > 0 ? raw.web_pages[0] : null,
  };
}

function recordSearchHistory(country, name, resultCount) {
  try {
    const db = getDb();
    db.prepare(
      'INSERT INTO search_history (country, name, result_count) VALUES (?, ?, ?)'
    ).run(country || null, name || null, resultCount);
  } catch (err) {
    logger.error(`Failed to record search history: ${err.message}`);
  }
}

async function callExternalApi(params) {
  try {
    const response = await httpClient.get('/search', { params });
    return response.data;
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      logger.error(`External Universities API timed out after ${TIMEOUT_MS}ms`);
      throw new ServiceUnavailableError('Universities API timed out. Please try again later.');
    }
    if (err.response) {
      logger.error(`External Universities API returned ${err.response.status}`);
      throw new ServiceUnavailableError('Universities API returned an unexpected error.');
    }
    logger.error(`External Universities API unreachable: ${err.message}`);
    throw new ServiceUnavailableError('Universities API is currently unavailable.');
  }
}

async function searchUniversities({ country, name }) {
  const cacheKey = `search:${country.toLowerCase()}:${(name || '').toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.info(`Cache hit for ${cacheKey}`);
    return cached;
  }

  const params = { country };
  if (name) params.name = name;

  const raw = await callExternalApi(params);
  const results = Array.isArray(raw) ? raw.map(mapUniversity) : [];

  cache.set(cacheKey, results);
  recordSearchHistory(country, name, results.length);

  return results;
}

async function getUniversityByName(name) {
  const cacheKey = `detail:${name.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.info(`Cache hit for ${cacheKey}`);
    return cached;
  }

  const raw = await callExternalApi({ name });
  const list = Array.isArray(raw) ? raw : [];

  const match = list.find((u) => u.name.toLowerCase() === name.toLowerCase());
  if (!match) {
    throw new NotFoundError(`No university found with name "${name}"`);
  }

  const mapped = mapUniversity(match);
  cache.set(cacheKey, mapped);
  return mapped;
}

module.exports = {
  searchUniversities,
  getUniversityByName,
  mapUniversity,
};
