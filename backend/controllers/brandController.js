const db = require('../models');
const Brand = db.Brand;

exports.createBrand = async (req, res) => {
  try {
    const image = req.file ? req.file.filename : null;
    // Create the brand record
    const brand = await Brand.create({ 
      name: req.body.name, 
      image 
    });

    // Process the subcategories payload
    let subcategories = req.body.subcategories;
    if (subcategories) {
      // If subcategories is a string, parse it (e.g., it might be a JSON string)
      if (typeof subcategories === 'string') {
        subcategories = JSON.parse(subcategories);
      }
      // If it's an array and not empty, set the associations
      if (Array.isArray(subcategories) && subcategories.length > 0) {
        await brand.setSubcategories(subcategories);
      }
    }

    res.json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Not found' });
    
    // Update basic fields
    brand.name = req.body.name || brand.name;
    if (req.file) {
      brand.image = req.file.filename;
    }
    await brand.save();

    // Process subcategories associations if provided
    if (req.body.subcategories) {
      let subcategories = req.body.subcategories;
      if (typeof subcategories === 'string') {
        subcategories = JSON.parse(subcategories);
      }
      if (Array.isArray(subcategories)) {
        await brand.setSubcategories(subcategories);
      }
    }

    res.json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all brands
exports.getBrands = async (req, res) => {
  try {
    // Include associated subcategories if needed
    const brands = await Brand.findAll({
      include: [{
        model: db.Subcategory,
        as: 'Subcategories',
        through: { attributes: [] }
      }]
    });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Not found' });
    await brand.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
