const {
  validateSearchParams,
  validateFavouritePayload,
  validateIdParam,
  validatePagination,
} = require('../../src/middleware/validators');
const { ValidationError } = require('../../src/utils/errors');

describe('validateSearchParams', () => {
  test('accepts a valid country only', () => {
    const result = validateSearchParams({ country: 'India' });
    expect(result).toEqual({ country: 'India', name: undefined });
  });

  test('accepts country + name and trims whitespace', () => {
    const result = validateSearchParams({ country: '  India  ', name: ' engineering ' });
    expect(result).toEqual({ country: 'India', name: 'engineering' });
  });

  test('throws ValidationError when country is missing', () => {
    expect(() => validateSearchParams({})).toThrow(ValidationError);
  });

  test('throws ValidationError when country is empty string', () => {
    expect(() => validateSearchParams({ country: '   ' })).toThrow(ValidationError);
  });

  test('throws ValidationError when name is an empty string', () => {
    expect(() => validateSearchParams({ country: 'India', name: '   ' })).toThrow(ValidationError);
  });
});

describe('validateFavouritePayload', () => {
  test('accepts valid name + country', () => {
    const result = validateFavouritePayload({ name: 'MIT', country: 'USA' });
    expect(result.name).toBe('MIT');
    expect(result.country).toBe('USA');
  });

  test('defaults optional domain/website to null', () => {
    const result = validateFavouritePayload({ name: 'MIT', country: 'USA' });
    expect(result.domain).toBeNull();
    expect(result.website).toBeNull();
  });

  test('throws when body is missing', () => {
    expect(() => validateFavouritePayload(undefined)).toThrow(ValidationError);
  });

  test('throws when name is missing', () => {
    expect(() => validateFavouritePayload({ country: 'USA' })).toThrow(ValidationError);
  });

  test('throws when country is missing', () => {
    expect(() => validateFavouritePayload({ name: 'MIT' })).toThrow(ValidationError);
  });

  test('throws when domain is not a string', () => {
    expect(() =>
      validateFavouritePayload({ name: 'MIT', country: 'USA', domain: 123 })
    ).toThrow(ValidationError);
  });
});

describe('validateIdParam', () => {
  test('accepts a positive integer string', () => {
    expect(validateIdParam('5')).toBe(5);
  });

  test('throws for zero', () => {
    expect(() => validateIdParam('0')).toThrow(ValidationError);
  });

  test('throws for negative numbers', () => {
    expect(() => validateIdParam('-1')).toThrow(ValidationError);
  });

  test('throws for non-numeric strings', () => {
    expect(() => validateIdParam('abc')).toThrow(ValidationError);
  });

  test('throws for decimals', () => {
    expect(() => validateIdParam('1.5')).toThrow(ValidationError);
  });
});

describe('validatePagination', () => {
  test('applies defaults when nothing is provided', () => {
    const result = validatePagination({});
    expect(result).toEqual({ page: 1, limit: 10, sortBy: 'created_at', order: 'DESC' });
  });

  test('accepts custom page/limit', () => {
    const result = validatePagination({ page: '2', limit: '5' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
  });

  test('falls back to created_at for an unknown sort field', () => {
    const result = validatePagination({ sortBy: 'not_a_column' });
    expect(result.sortBy).toBe('created_at');
  });

  test('accepts name/country as sortBy', () => {
    expect(validatePagination({ sortBy: 'name' }).sortBy).toBe('name');
    expect(validatePagination({ sortBy: 'country' }).sortBy).toBe('country');
  });

  test('normalizes order to ASC/DESC', () => {
    expect(validatePagination({ order: 'asc' }).order).toBe('ASC');
    expect(validatePagination({ order: 'ASC' }).order).toBe('ASC');
    expect(validatePagination({ order: 'garbage' }).order).toBe('DESC');
  });

  test('throws for limit above 100', () => {
    expect(() => validatePagination({ limit: '101' })).toThrow(ValidationError);
  });

  test('throws for page 0', () => {
    expect(() => validatePagination({ page: '0' })).toThrow(ValidationError);
  });
});
