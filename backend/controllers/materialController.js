const db = require('../models');
const Material = db.Material;

exports.createMaterial = async (req, res) => {
  try {
    const { name, description, isNew, highlighted } = req.body;
    // 'iconImage' comes from file upload via Multer
    const iconImage = req.files['iconImage'] ? req.files['iconImage'][0].filename : null;
    // Create the material without a price field at the material level
    const material = await Material.create({
      name,
      description,
      iconImage,
      isNew: isNew || false,
      highlighted: highlighted || false
    });

    // Process modelLinks JSON - each link should include { modelId, price }
    let modelLinks = [];
    if (req.body.modelLinks) {
      try {
        modelLinks = JSON.parse(req.body.modelLinks);
      } catch (e) {
        modelLinks = [];
      }
    }
    // Retrieve model link images from req.files
    const modelLinkImages = req.files['modelLinkImages'] || [];
    for (let i = 0; i < modelLinks.length; i++) {
      const link = modelLinks[i];
      const imageFilename = modelLinkImages[i] ? modelLinkImages[i].filename : '';
      await material.addModelItem(link.modelId, { through: { image: imageFilename, price: link.price } });
    }
    res.json(material);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.findAll({ 
      include: [{
        model: db.ModelItem,
        as: 'ModelItems'
      }]
    });
    console.log(materials);
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).json({ message: 'Not found' });
    const { name, description, isNew, highlighted } = req.body;
    if (name) material.name = name;
    if (description !== undefined) material.description = description;
    if (isNew !== undefined) material.isNew = isNew;
    if (highlighted !== undefined) material.highlighted = highlighted;
    if (req.files['iconImage']) {
      material.iconImage = req.files['iconImage'][0].filename;
    }
    await material.save();

    // Process modelLinks update; remove existing associations and add new ones
    if (req.body.modelLinks) {
      let modelLinks = [];
      try {
        modelLinks = JSON.parse(req.body.modelLinks);
      } catch (e) {
        modelLinks = [];
      }
      await material.setModelItems([]); // Remove old associations
      const modelLinkImages = req.files['modelLinkImages'] || [];
      for (let i = 0; i < modelLinks.length; i++) {
        const link = modelLinks[i];
        const imageFilename = modelLinkImages[i] ? modelLinkImages[i].filename : '';
        await material.addModelItem(link.modelId, { through: { image: imageFilename, price: link.price } });
      }
    }
    res.json(material);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).json({ message: 'Not found' });
    await material.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
