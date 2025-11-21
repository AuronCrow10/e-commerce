module.exports = (sequelize, DataTypes) => {
  const ModelItem = sequelize.define('Model', {
    name: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true }, // new field for model image
    isNew: { type: DataTypes.BOOLEAN, defaultValue: false },
    highlighted: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
  return ModelItem;
};
