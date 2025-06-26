import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { Test, Comment, Like, Visitor } from './models/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 라우트 예시
app.get('/api/tests', async (req, res) => {
  const tests = await Test.findAll();
  res.json(tests);
});

app.get('/api/visitors/count', async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const total = await Visitor.count();
  const todayCount = await Visitor.count({ where: { visitedAt: { [sequelize.Op.gte]: today } } });
  res.json({ total, today: todayCount });
});

// 서버 시작 및 DB 동기화
const PORT = process.env.PORT || 4000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 