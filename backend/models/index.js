const { Sequelize } = require('sequelize');
const config = require('../config/config').development;

const sequelize = new Sequelize(config.url, {
  dialect: config.dialect,
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Category = require('./category')(sequelize, Sequelize);
db.Subcategory = require('./subcategory')(sequelize, Sequelize);
db.Brand = require('./brand')(sequelize, Sequelize);
db.ModelItem = require('./model')(sequelize, Sequelize); // "Model" renamed to ModelItem
db.Material = require('./material')(sequelize, Sequelize);
db.Order = require('./order')(sequelize, Sequelize);
db.AdminUser = require('./adminUser')(sequelize, Sequelize);

// Associations

// Category <-> Subcategory (many-to-many)
db.Category.belongsToMany(db.Subcategory, { 
  through: 'CategorySubcategories', 
  foreignKey: 'categoryId' 
});
db.Subcategory.belongsToMany(db.Category, { 
  through: 'CategorySubcategories', 
  foreignKey: 'subcategoryId' 
});

// Subcategory <-> Brand (many-to-many) with aliases
db.Subcategory.belongsToMany(db.Brand, { 
  through: 'SubcategoryBrands', 
  foreignKey: 'subcategoryId', 
  as: 'Brands' 
});
db.Brand.belongsToMany(db.Subcategory, { 
  through: 'SubcategoryBrands', 
  foreignKey: 'brandId', 
  as: 'Subcategories' 
});

// Brand -> Model (one-to-many)
db.Brand.hasMany(db.ModelItem, { foreignKey: 'brandId' });
db.ModelItem.belongsTo(db.Brand, { foreignKey: 'brandId' });

// Subcategory -> Model (one-to-many)
db.Subcategory.hasMany(db.ModelItem, { foreignKey: 'subcategoryId' });
db.ModelItem.belongsTo(db.Subcategory, { foreignKey: 'subcategoryId' });

// Category <-> Material (many-to-many)
db.Category.belongsToMany(db.Material, { 
  through: 'CategoryMaterials', 
  foreignKey: 'categoryId' 
});
db.Material.belongsToMany(db.Category, { 
  through: 'CategoryMaterials', 
  foreignKey: 'materialId' 
});

// Subcategory <-> Material (many-to-many)
db.Subcategory.belongsToMany(db.Material, { 
  through: 'SubcategoryMaterials', 
  foreignKey: 'subcategoryId' 
});
db.Material.belongsToMany(db.Subcategory, { 
  through: 'SubcategoryMaterials', 
  foreignKey: 'materialId' 
});

// Model <-> Material (many-to-many with extra fields "image" and "price")
db.ModelItem.belongsToMany(db.Material, { 
  through: db.ModelMaterial = sequelize.define('ModelMaterial', {
    image: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    }
  }, { timestamps: false }),
  foreignKey: 'modelId'
});
db.Material.belongsToMany(db.ModelItem, { 
  through: db.ModelMaterial, 
  foreignKey: 'materialId',
  as: 'ModelItems' // Generates methods like addModelItem, getModelItems, etc.
});

module.exports = db;
