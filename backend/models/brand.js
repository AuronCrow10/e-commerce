module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define('Brand', {
    name: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true }  // new field for image URL
  });
  return Brand;
};
