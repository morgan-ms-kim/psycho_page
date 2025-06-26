import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import Test from './Test.js';
import Comment from './Comment.js';
import Like from './Like.js';
import Visitor from './Visitor.js';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

// 관계 정의
Test.hasMany(Comment, { foreignKey: 'testId' });
Comment.belongsTo(Test, { foreignKey: 'testId' });

Test.hasMany(Like, { foreignKey: 'testId' });
Like.belongsTo(Test, { foreignKey: 'testId' });

Comment.hasMany(Like, { foreignKey: 'commentId' });
Like.belongsTo(Comment, { foreignKey: 'commentId' });

Test.hasMany(Visitor, { foreignKey: 'testId' });
Visitor.belongsTo(Test, { foreignKey: 'testId' });

export { Test, Comment, Like, Visitor };
export default sequelize; 