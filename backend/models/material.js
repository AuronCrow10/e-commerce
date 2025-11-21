module.exports = (sequelize, DataTypes) => {
    const Material = sequelize.define('Material', {
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      iconImage: { type: DataTypes.STRING, allowNull: true },
      isNew: { type: DataTypes.BOOLEAN, defaultValue: false },
      highlighted: { type: DataTypes.BOOLEAN, defaultValue: false }
    });
    return Material;
  };
  