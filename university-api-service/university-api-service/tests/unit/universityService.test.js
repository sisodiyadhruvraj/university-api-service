const mockGet = jest.fn();

jest.mock('axios', () => ({
  create: jest.fn(() => ({ get: (...args) => mockGet(...args) })),
}));

jest.mock('../../src/config/db', () => ({
  getDb: jest.fn(() => ({
    prepare: jest.fn(() => ({ run: jest.fn() })),
  })),
}));

const universityService = require('../../src/services/universityService');
const cache = require('../../src/utils/cache');
const { NotFoundError, ServiceUnavailableError } = require('../../src/utils/errors');

const RAW_SAMPLE = [
  {
    name: 'Indian Institute of Technology Delhi',
    country: 'India',
    domains: ['iitd.ac.in'],
    web_pages: ['http://www.iitd.ac.in'],
  },
  {
    name: 'Indian Institute of Technology Bombay',
    country: 'India',
    domains: ['iitb.ac.in'],
    web_pages: ['http://www.iitb.ac.in'],
  },
];

describe('universityService.searchUniversities', () => {
  beforeEach(() => {
    mockGet.mockReset();
    cache.clear();
  });

  test('maps external API shape into simplified contract', async () => {
    mockGet.mockResolvedValue({ data: RAW_SAMPLE });

    const results = await universityService.searchUniversities({ country: 'India' });

    expect(results).toEqual([
      {
        name: 'Indian Institute of Technology Delhi',
        country: 'India',
        domain: 'iitd.ac.in',
        website: 'http://www.iitd.ac.in',
      },
      {
        name: 'Indian Institute of Technology Bombay',
        country: 'India',
        domain: 'iitb.ac.in',
        website: 'http://www.iitb.ac.in',
      },
    ]);
    expect(mockGet).toHaveBeenCalledWith('/search', { params: { country: 'India' } });
  });

  test('passes the name filter through to the external API', async () => {
    mockGet.mockResolvedValue({ data: [RAW_SAMPLE[0]] });

    await universityService.searchUniversities({ country: 'India', name: 'Delhi' });

    expect(mockGet).toHaveBeenCalledWith('/search', {
      params: { country: 'India', name: 'Delhi' },
    });
  });

  test('returns an empty array when nothing matches', async () => {
    mockGet.mockResolvedValue({ data: [] });

    const results = await universityService.searchUniversities({ country: 'Atlantis' });

    expect(results).toEqual([]);
  });

  test('serves a second identical search from cache without calling axios again', async () => {
    mockGet.mockResolvedValue({ data: RAW_SAMPLE });

    await universityService.searchUniversities({ country: 'India' });
    await universityService.searchUniversities({ country: 'India' });

    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  test('throws ServiceUnavailableError when the external API times out', async () => {
    const timeoutError = new Error('timeout of 5000ms exceeded');
    timeoutError.code = 'ECONNABORTED';
    mockGet.mockRejectedValue(timeoutError);

    await expect(universityService.searchUniversities({ country: 'India' })).rejects.toThrow(
      ServiceUnavailableError
    );
  });

  test('throws ServiceUnavailableError when the external API is unreachable', async () => {
    mockGet.mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));

    await expect(universityService.searchUniversities({ country: 'India' })).rejects.toThrow(
      ServiceUnavailableError
    );
  });

  test('throws ServiceUnavailableError when the external API responds with an error status', async () => {
    const err = new Error('Request failed');
    err.response = { status: 500 };
    mockGet.mockRejectedValue(err);

    await expect(universityService.searchUniversities({ country: 'India' })).rejects.toThrow(
      ServiceUnavailableError
    );
  });
});

describe('universityService.getUniversityByName', () => {
  beforeEach(() => {
    mockGet.mockReset();
    cache.clear();
  });

  test('returns the matching university (case-insensitive)', async () => {
    mockGet.mockResolvedValue({ data: RAW_SAMPLE });

    const result = await universityService.getUniversityByName(
      'indian institute of technology delhi'
    );

    expect(result.name).toBe('Indian Institute of Technology Delhi');
    expect(result.domain).toBe('iitd.ac.in');
  });

  test('throws NotFoundError when no exact match exists', async () => {
    mockGet.mockResolvedValue({ data: RAW_SAMPLE });

    await expect(universityService.getUniversityByName('Not A Real University')).rejects.toThrow(
      NotFoundError
    );
  });
});
