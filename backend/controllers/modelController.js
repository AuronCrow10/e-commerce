const db = require('../models');
const ModelItem = db.ModelItem;

exports.createModel = async (req, res) => {
  try {
    const image = req.file ? req.file.filename : null;
    const { name, brandId, subcategoryId, isNew, highlighted } = req.body;
    const modelItem = await ModelItem.create({
      name,
      brandId,
      subcategoryId,
      image,  // store the image filename
      isNew: isNew || false,
      highlighted: highlighted || false
    });
    res.json(modelItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateModel = async (req, res) => {
  try {
    const modelItem = await ModelItem.findByPk(req.params.id);
    if (!modelItem) return res.status(404).json({ message: 'Not found' });
    const { name, isNew, highlighted } = req.body;
    modelItem.name = name || modelItem.name;
    if (req.file) modelItem.image = req.file.filename;
    modelItem.isNew = isNew !== undefined ? isNew : modelItem.isNew;
    modelItem.highlighted = highlighted !== undefined ? highlighted : modelItem.highlighted;
    await modelItem.save();
    res.json(modelItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getModels = async (req, res) => {
  try {
    // Optionally, you can add filtering by subcategory (e.g., ?subcategoryId=)
    const models = await ModelItem.findAll();
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Get a single model by ID (for user product page)
exports.getModel = async (req, res) => {
  try {
    const modelItem = await ModelItem.findByPk(req.params.id);
    if (!modelItem) return res.status(404).json({ message: 'Not found' });
    res.json(modelItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteModel = async (req, res) => {
  try {
    const modelItem = await ModelItem.findByPk(req.params.id);
    if (!modelItem) return res.status(404).json({ message: 'Not found' });
    await modelItem.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
