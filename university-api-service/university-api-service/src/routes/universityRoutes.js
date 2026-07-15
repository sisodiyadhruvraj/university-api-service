const express = require('express');
const controller = require('../controllers/universityController');
const { searchQueryValidator } = require('../middleware/validators');

const router = express.Router();

/**
 * @swagger
 * /api/universities:
 *   get:
 *     summary: Search universities by country (and optional name filter)
 *     tags: [Universities]
 *     parameters:
 *       - in: query
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *         example: India
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         example: engineering
 *     responses:
 *       200:
 *         description: List of matching universities (possibly empty)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/University'
 *       400:
 *         description: Missing or invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       503:
 *         description: External Universities API is unavailable or timed out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', searchQueryValidator, controller.search);

/**
 * @swagger
 * /api/universities/{name}:
 *   get:
 *     summary: Get details for a single university by exact name
 *     tags: [Universities]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         example: Indian Institute of Technology Delhi
 *     responses:
 *       200:
 *         description: University details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/University'
 *       404:
 *         description: No university found with that name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       503:
 *         description: External Universities API is unavailable or timed out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:name', controller.getByName);

module.exports = router;
