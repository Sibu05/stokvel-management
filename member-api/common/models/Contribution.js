const { DataTypes } = require('sequelize');

const ContributionModel = {
  id:          { type: DataTypes.INTEGER,       primaryKey: true, autoIncrement: true },
  groupId:     { type: DataTypes.INTEGER,       allowNull: false },
  userId:      { type: DataTypes.INTEGER,       allowNull: false },
  cycleNumber: { type: DataTypes.INTEGER,       allowNull: false },
  amount:      { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0.00 },
  status:      { type: DataTypes.ENUM('paid', 'outstanding'), allowNull: false, defaultValue: 'outstanding' },
  paidAt:      { type: DataTypes.DATE,          allowNull: true },
};

module.exports = (sequelize) => sequelize.define('contribution', ContributionModel);
