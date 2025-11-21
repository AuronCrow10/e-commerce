module.exports = (sequelize, DataTypes) => {
    const AdminUser = sequelize.define('AdminUser', {
      username: { type: DataTypes.STRING, unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'admin' }
    });
    return AdminUser;
  };
  