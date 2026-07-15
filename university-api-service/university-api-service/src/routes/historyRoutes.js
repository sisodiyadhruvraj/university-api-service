const express = require('express');
const controller = require('../controllers/historyController');
const { paginationValidator } = require('../middleware/validators');

const router = express.Router();

/**
 * @swagger
 * /api/search-history:
 *   get:
 *     summary: List recent university searches (bonus feature)
 *     tags: [History]
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
 *     responses:
 *       200:
 *         description: Paginated list of past searches
 */
router.get('/', paginationValidator, controller.list);

module.exports = router;
