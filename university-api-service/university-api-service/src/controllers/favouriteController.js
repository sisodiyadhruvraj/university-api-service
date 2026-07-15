const favouriteService = require('../services/favouriteService');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const favourite = favouriteService.addFavourite(req.validated);
  res.status(201).json(favourite);
});

const list = asyncHandler(async (req, res) => {
  const result = favouriteService.getFavourites(req.validatedPagination);
  res.status(200).json(result);
});

const remove = asyncHandler(async (req, res) => {
  const id = req.validatedId;
  favouriteService.deleteFavourite(id);
  res.status(200).json({ message: `Favourite with id ${id} deleted successfully` });
});

module.exports = { create, list, remove };
