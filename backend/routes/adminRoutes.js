const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');
const subcategoryController = require('../controllers/subcategoryController');
const brandController = require('../controllers/brandController');
const modelController = require('../controllers/modelController');
const materialController = require('../controllers/materialController');
const orderController = require('../controllers/orderController');
const { upload } = require('../middleware/uploadMiddleware');

// Protect all admin routes
router.use(verifyToken);

// Categories
router.post('/categories', categoryController.createCategory);
router.get('/categories', categoryController.getCategories);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Subcategories
router.post('/subcategories', subcategoryController.createSubcategory);
router.get('/subcategories', subcategoryController.getSubcategories);
router.put('/subcategories/:id', subcategoryController.updateSubcategory);
router.delete('/subcategories/:id', subcategoryController.deleteSubcategory);

// Brands
router.post('/brands', upload.single('image'), brandController.createBrand);
router.put('/brands/:id', upload.single('image'), brandController.updateBrand);
router.get('/brands', brandController.getBrands);
router.delete('/brands/:id', brandController.deleteBrand);

// Models
router.post('/models', upload.single('image'), modelController.createModel);
router.put('/models/:id', upload.single('image'), modelController.updateModel);
router.get('/models', modelController.getModels);
router.delete('/models/:id', modelController.deleteModel);

// Materials (with file upload for iconImage)
router.post('/materials', 
    upload.fields([
      { name: 'iconImage', maxCount: 1 },
      { name: 'modelLinkImages', maxCount: 10 }
    ]),
    materialController.createMaterial
  );
router.get('/materials', materialController.getMaterials);
router.put('/materials/:id', 
    upload.fields([
      { name: 'iconImage', maxCount: 1 },
      { name: 'modelLinkImages', maxCount: 10 }
    ]),
    materialController.updateMaterial
  );
router.delete('/materials/:id', materialController.deleteMaterial);

// Orders
router.get('/orders', orderController.getOrders);
router.put('/orders/:id', orderController.updateOrderStatus);
router.post('/orders', orderController.createOrder);

module.exports = router;
