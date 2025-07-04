import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
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

// 모델 정의
const Test = sequelize.define('Test', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  thumbnail: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  views: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  likes: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

const Comment = sequelize.define('Comment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  testId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  nickname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  likes: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

const Like = sequelize.define('Like', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  testId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  commentId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  ip: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

const Visitor = sequelize.define('Visitor', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  testId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  ip: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  country: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  region: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  userAgent: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  page: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  visitedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

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