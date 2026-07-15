const { ValidationError } = require('../utils/errors');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateSearchParams({ country, name }) {
  if (!isNonEmptyString(country)) {
    throw new ValidationError('Query parameter "country" is required and must be a non-empty string');
  }
  if (name !== undefined && !isNonEmptyString(name)) {
    throw new ValidationError('Query parameter "name" must be a non-empty string when provided');
  }
  return {
    country: country.trim(),
    name: name ? name.trim() : undefined,
  };
}

function validateFavouritePayload(body) {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body is required');
  }
  const { name, country, domain, website } = body;
  if (!isNonEmptyString(name)) {
    throw new ValidationError('Field "name" is required and must be a non-empty string');
  }
  if (!isNonEmptyString(country)) {
    throw new ValidationError('Field "country" is required and must be a non-empty string');
  }
  if (domain !== undefined && domain !== null && typeof domain !== 'string') {
    throw new ValidationError('Field "domain" must be a string when provided');
  }
  if (website !== undefined && website !== null && typeof website !== 'string') {
    throw new ValidationError('Field "website" must be a string when provided');
  }
  return {
    name: name.trim(),
    country: country.trim(),
    domain: domain ? domain.trim() : null,
    website: website ? website.trim() : null,
  };
}

function validateIdParam(idRaw) {
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(`"${idRaw}" is not a valid id. Id must be a positive integer`);
  }
  return id;
}

function validatePagination({ page, limit, sortBy, order }) {
  const parsedPage = page !== undefined ? Number(page) : 1;
  const parsedLimit = limit !== undefined ? Number(limit) : 10;

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    throw new ValidationError('Query parameter "page" must be a positive integer');
  }
  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    throw new ValidationError('Query parameter "limit" must be an integer between 1 and 100');
  }

  const allowedSortFields = ['name', 'country', 'created_at'];
  const sortField = sortBy && allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

  const sortOrder = order && order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  return { page: parsedPage, limit: parsedLimit, sortBy: sortField, order: sortOrder };
}

function searchQueryValidator(req, res, next) {
  try {
    req.validated = validateSearchParams(req.query);
    next();
  } catch (err) {
    next(err);
  }
}

function favouriteBodyValidator(req, res, next) {
  try {
    req.validated = validateFavouritePayload(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

function idParamValidator(req, res, next) {
  try {
    req.validatedId = validateIdParam(req.params.id);
    next();
  } catch (err) {
    next(err);
  }
}

function paginationValidator(req, res, next) {
  try {
    req.validatedPagination = validatePagination(req.query);
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  isNonEmptyString,
  validateSearchParams,
  validateFavouritePayload,
  validateIdParam,
  validatePagination,
  searchQueryValidator,
  favouriteBodyValidator,
  idParamValidator,
  paginationValidator,
};
