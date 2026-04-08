const { DataTypes } = require('sequelize');

const MemberModel = {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email:    { type: DataTypes.STRING,  allowNull: false, unique: true },
  groupId:  { type: DataTypes.INTEGER, allowNull: false },
  status:   { type: DataTypes.ENUM('active', 'inactive'), allowNull: false, defaultValue: 'active' },
  joinedAt: { type: DataTypes.DATE },
};

module.exports = (sequelize) => sequelize.define('member', MemberModel);
