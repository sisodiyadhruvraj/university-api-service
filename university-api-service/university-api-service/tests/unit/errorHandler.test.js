const { notFoundHandler, globalErrorHandler } = require('../../src/middleware/errorHandler');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
} = require('../../src/utils/errors');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return { method: 'GET', originalUrl: '/api/test', ...overrides };
}

describe('notFoundHandler', () => {
  test('responds 404 with a descriptive message including method and path', () => {
    const req = mockReq({ method: 'POST', originalUrl: '/api/does-not-exist' });
    const res = mockRes();

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: expect.stringContaining('POST /api/does-not-exist'),
      })
    );
  });
});

describe('globalErrorHandler', () => {
  const cases = [
    { ErrorClass: ValidationError, message: 'bad input', expectedStatus: 400, expectedName: 'ValidationError' },
    { ErrorClass: NotFoundError, message: 'missing', expectedStatus: 404, expectedName: 'NotFoundError' },
    { ErrorClass: ConflictError, message: 'dup', expectedStatus: 409, expectedName: 'ConflictError' },
    {
      ErrorClass: ServiceUnavailableError,
      message: 'upstream down',
      expectedStatus: 503,
      expectedName: 'ServiceUnavailableError',
    },
  ];

  test.each(cases)(
    'maps $expectedName to HTTP $expectedStatus with the original message',
    ({ ErrorClass, message, expectedStatus, expectedName }) => {
      const err = new ErrorClass(message);
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      globalErrorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith({
        error: expectedName,
        message,
        statusCode: expectedStatus,
      });
      expect(next).not.toHaveBeenCalled();
    }
  );

  test('maps an unrecognized/unexpected error to a generic 500 without leaking internals', () => {
    const err = new TypeError("Cannot read properties of undefined (reading 'foo')");
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    globalErrorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    const payload = res.json.mock.calls[0][0];
    expect(payload.statusCode).toBe(500);
    expect(payload.error).toBe('InternalServerError');
    expect(payload.message).not.toContain('Cannot read properties');
    expect(JSON.stringify(payload)).not.toContain('TypeError');
  });

  test('handles a thrown plain string/non-Error gracefully (defensive case)', () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    expect(() => globalErrorHandler({ message: 'weird rejection' }, req, res, next)).not.toThrow();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
