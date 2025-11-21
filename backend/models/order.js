module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Order', {
    orderIdentifier: {type: DataTypes.STRING, unique: true, allowNull: false},
    products: {type: DataTypes.JSONB, allowNull: false},
    paymentStatus: {type: DataTypes.STRING, allowNull: false},
    paymentIntent: {type: DataTypes.STRING, allowNull: true},
    orderStatus: {type: DataTypes.STRING, allowNull: false},
    shippingInfo: {type: DataTypes.JSONB, allowNull: true}, // New field for shipping details
    billingInfo: {type: DataTypes.JSONB, allowNull: true},
  });
};
