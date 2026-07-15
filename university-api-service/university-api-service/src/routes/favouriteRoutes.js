const express = require('express');
const controller = require('../controllers/favouriteController');
const {
  favouriteBodyValidator,
  idParamValidator,
  paginationValidator,
} = require('../middleware/validators');

const router = express.Router();

/**
 * @swagger
 * /api/favourites:
 *   post:
 *     summary: Save a university to favourites
 *     tags: [Favourites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FavouriteInput'
 *     responses:
 *       201:
 *         description: Favourite created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favourite'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Favourite already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', favouriteBodyValidator, controller.create);

/**
 * @swagger
 * /api/favourites:
 *   get:
 *     summary: List favourite universities (paginated, sortable)
 *     tags: [Favourites]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, country, created_at]
 *           default: created_at
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Paginated list of favourites
 */
router.get('/', paginationValidator, controller.list);

/**
 * @swagger
 * /api/favourites/{id}:
 *   delete:
 *     summary: Delete a favourite by id
 *     tags: [Favourites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Favourite deleted
 *       404:
 *         description: Favourite not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', idParamValidator, controller.remove);

module.exports = router;
