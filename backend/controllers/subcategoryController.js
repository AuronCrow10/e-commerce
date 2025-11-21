const db = require('../models');
const Subcategory = db.Subcategory;

exports.createSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.create({ name: req.body.name });
    if (req.body.categories && req.body.categories.length > 0) {
      await subcategory.setCategories(req.body.categories);
    }
    res.json(subcategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.findAll({ include: db.Category });
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByPk(req.params.id);
    if (!subcategory) return res.status(404).json({ message: 'Not found' });
    subcategory.name = req.body.name || subcategory.name;
    await subcategory.save();
    if (req.body.categories) {
      await subcategory.setCategories(req.body.categories);
    }
    res.json(subcategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByPk(req.params.id);
    if (!subcategory) return res.status(404).json({ message: 'Not found' });
    await subcategory.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
