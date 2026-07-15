const universityService = require('../services/universityService');
const asyncHandler = require('../utils/asyncHandler');

const search = asyncHandler(async (req, res) => {
  const { country, name } = req.validated;
  const results = await universityService.searchUniversities({ country, name });
  res.status(200).json(results);
});

const getByName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const result = await universityService.getUniversityByName(name);
  res.status(200).json(result);
});

module.exports = { search, getByName };
