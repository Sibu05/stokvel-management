const { DataTypes } = require('sequelize');

const UserModel = {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  authId:    { type: DataTypes.STRING,  allowNull: false, unique: true }, // Auth0 sub
  firstName: { type: DataTypes.STRING,  allowNull: false },
  lastName:  { type: DataTypes.STRING,  allowNull: false },
  email:     { type: DataTypes.STRING,  allowNull: false, unique: true },
  avatarUrl: { type: DataTypes.STRING },
};

module.exports = (sequelize) => sequelize.define('user', UserModel);
