const { DataTypes } = require('sequelize');

const GroupModel = {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING,  allowNull: false },
  description: { type: DataTypes.STRING },
  cycleType:   { type: DataTypes.ENUM('monthly', 'weekly'), allowNull: false },
  startDate:   { type: DataTypes.DATE, allowNull: false },
  // createdAt removed — Sequelize manages this automatically
};

module.exports = (sequelize) => sequelize.define('group', GroupModel);
