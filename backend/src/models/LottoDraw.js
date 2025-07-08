import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const LottoDraw = sequelize.define('LottoDraw', {
  drawNo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  numbers: {
    type: DataTypes.STRING, // 예: '1,2,3,4,5,6'
    allowNull: false,
  },
  bonus: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  drawDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default LottoDraw; 