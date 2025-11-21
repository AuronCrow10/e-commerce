const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const modelController = require('../controllers/modelController');
const materialController = require('../controllers/materialController');
const brandController = require('../controllers/brandController');

// Public endpoints
router.get('/categories', categoryController.getCategories);
router.get('/models', modelController.getModels);
router.get('/models/:id', modelController.getModel); // New endpoint for single model details
router.get('/materials', materialController.getMaterials);
router.get('/brands', brandController.getBrands);

module.exports = router;