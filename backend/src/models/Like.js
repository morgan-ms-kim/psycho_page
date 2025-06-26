import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  testId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Like; 