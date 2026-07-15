const favouriteService = require('../services/favouriteService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = favouriteService.getSearchHistory(req.validatedPagination);
  res.status(200).json(result);
});

module.exports = { list };
