const express = require('express');
const cosmicObjectController = require('../controllers/cosmicObjectController');
const router = express.Router();

// API routes
router.get('/search', cosmicObjectController.searchObjects);
router.get('/types', cosmicObjectController.getTypes);
router.get('/featured', cosmicObjectController.getFeaturedObjects);
router.get('/:slug', cosmicObjectController.getObjectBySlug);

module.exports = router;