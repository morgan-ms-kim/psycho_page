import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { Test, Comment, Like, Visitor } from './models/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 모든 테스트 목록 가져오기 (조회수, 좋아요 포함)
app.get('/api/tests', async (req, res) => {
  try {
    const tests = await Test.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 테스트별 상세 정보 (조회수, 좋아요, 댓글 수)
app.get('/api/tests/:id', async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    // 조회수 증가
    await test.increment('views');
    
    // 댓글 수 계산
    const commentCount = await Comment.count({ where: { testId: req.params.id } });
    
    res.json({
      ...test.toJSON(),
      commentCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 좋아요 토글
app.post('/api/tests/:id/like', async (req, res) => {
  try {
    const { ip } = req.body;
    const testId = req.params.id;
    
    const existingLike = await Like.findOne({
      where: { testId, ip, commentId: null }
    });
    
    if (existingLike) {
      // 좋아요 취소
      await existingLike.destroy();
      await Test.decrement('likes', { where: { id: testId } });
      res.json({ liked: false });
    } else {
      // 좋아요 추가
      await Like.create({ testId, ip });
      await Test.increment('likes', { where: { id: testId } });
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 댓글 목록
app.get('/api/tests/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { testId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 댓글 작성
app.post('/api/tests/:id/comments', async (req, res) => {
  try {
    const { nickname, content } = req.body;
    const comment = await Comment.create({
      testId: req.params.id,
      nickname,
      content
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 방문자 통계
app.get('/api/visitors/count', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const total = await Visitor.count();
    const todayCount = await Visitor.count({ 
      where: { visitedAt: { [sequelize.Op.gte]: today } } 
    });
    res.json({ total, today: todayCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 방문자 기록
app.post('/api/visitors', async (req, res) => {
  try {
    const { ip, country, region, userAgent, testId } = req.body;
    await Visitor.create({
      ip,
      country,
      region,
      userAgent,
      testId
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 서버 시작 및 DB 동기화
const PORT = process.env.PORT || 4000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 