const db = require('../models');
const Category = db.Category;

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create({ name: req.body.name });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: {
        model: db.Subcategory, // or use db.Subcategory if you've imported db
        through: { attributes: [] } // optional: exclude through table data
      }
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    category.name = req.body.name || category.name;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    await category.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
