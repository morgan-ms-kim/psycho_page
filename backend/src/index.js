import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import sequelize, { Test, Comment, Like, Visitor } from './models/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// IP 주소 추출 미들웨어
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

// 에러 핸들링 미들웨어
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: '서버 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// 모든 테스트 목록 가져오기 (조회수, 좋아요 포함)
app.get('/api/tests', async (req, res, next) => {
  try {
    const { search, category, sort = 'latest', limit = 20 } = req.query;
    
    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    let orderClause = [['createdAt', 'DESC']];
    if (sort === 'views') orderClause = [['views', 'DESC']];
    if (sort === 'likes') orderClause = [['likes', 'DESC']];
    if (sort === 'popular') orderClause = [['views', 'DESC'], ['likes', 'DESC']];
    
    const tests = await Test.findAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit)
    });
    
    // 이미지 경로 수정
    const testsWithCorrectPaths = tests.map(test => {
      const testData = test.toJSON();
      if (testData.thumbnail) {
        // /psycho/tests/ 경로로 수정
        if (testData.thumbnail.startsWith('/tests/')) {
          testData.thumbnail = testData.thumbnail.replace('/tests/', '/psycho/tests/');
        } else if (!testData.thumbnail.startsWith('/psycho/tests/')) {
          testData.thumbnail = `/psycho/tests/${testData.thumbnail}`;
        }
      }
      return testData;
    });
    
    res.json(testsWithCorrectPaths);
  } catch (error) {
    next(error);
  }
});

// 테스트별 상세 정보 (조회수, 좋아요, 댓글 수)
app.get('/api/tests/:id', async (req, res, next) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ error: '테스트를 찾을 수 없습니다.' });
    }
    
    // 조회수 증가 (IP 기반 중복 방지)
    const clientIP = getClientIP(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingView = await Visitor.findOne({
      where: {
        testId: req.params.id,
        ip: clientIP,
        visitedAt: { [Op.gte]: today }
      }
    });
    
    if (!existingView) {
      await test.increment('views');
      await Visitor.create({
        ip: clientIP,
        testId: req.params.id,
        userAgent: req.headers['user-agent']
      });
    }
    
    // 댓글 수 계산
    const commentCount = await Comment.count({ where: { testId: req.params.id } });
    
    // 사용자의 좋아요 상태 확인
    const userLike = await Like.findOne({
      where: { 
        testId: req.params.id, 
        ip: clientIP,
        commentId: null 
      }
    });
    
    // 이미지 경로 수정
    const testData = test.toJSON();
    if (testData.thumbnail) {
      if (testData.thumbnail.startsWith('/tests/')) {
        testData.thumbnail = testData.thumbnail.replace('/tests/', '/psycho/tests/');
      } else if (!testData.thumbnail.startsWith('/psycho/tests/')) {
        testData.thumbnail = `/psycho/tests/${testData.thumbnail}`;
      }
    }
    
    res.json({
      ...testData,
      commentCount,
      userLiked: !!userLike
    });
  } catch (error) {
    next(error);
  }
});

// 좋아요 토글
app.post('/api/tests/:id/like', async (req, res, next) => {
  try {
    const clientIP = getClientIP(req);
    const testId = req.params.id;
    
    const existingLike = await Like.findOne({
      where: { testId, ip: clientIP, commentId: null }
    });
    
    if (existingLike) {
      // 좋아요 취소
      await existingLike.destroy();
      await Test.decrement('likes', { where: { id: testId } });
      res.json({ liked: false, message: '좋아요가 취소되었습니다.' });
    } else {
      // 좋아요 추가
      await Like.create({ testId, ip: clientIP });
      await Test.increment('likes', { where: { id: testId } });
      res.json({ liked: true, message: '좋아요가 추가되었습니다.' });
    }
  } catch (error) {
    next(error);
  }
});

// 댓글 목록
app.get('/api/tests/:id/comments', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const comments = await Comment.findAndCountAll({
      where: { testId: req.params.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      comments: comments.rows,
      total: comments.count,
      pages: Math.ceil(comments.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    next(error);
  }
});

// 댓글 작성
app.post('/api/tests/:id/comments', async (req, res, next) => {
  try {
    const { nickname, content } = req.body;
    
    if (!nickname || !content) {
      return res.status(400).json({ error: '닉네임과 내용을 모두 입력해주세요.' });
    }
    
    if (content.length > 500) {
      return res.status(400).json({ error: '댓글은 500자 이내로 작성해주세요.' });
    }
    
    const comment = await Comment.create({
      testId: req.params.id,
      nickname: nickname.trim(),
      content: content.trim(),
      ip: getClientIP(req)
    });
    
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// 댓글 좋아요 토글
app.post('/api/comments/:id/like', async (req, res, next) => {
  try {
    const clientIP = getClientIP(req);
    const commentId = req.params.id;
    
    const existingLike = await Like.findOne({
      where: { commentId, ip: clientIP }
    });
    
    if (existingLike) {
      await existingLike.destroy();
      res.json({ liked: false });
    } else {
      await Like.create({ commentId, ip: clientIP });
      res.json({ liked: true });
    }
  } catch (error) {
    next(error);
  }
});

// 카테고리 목록
app.get('/api/categories', async (req, res, next) => {
  try {
    // 더 안전한 방법으로 카테고리 조회
    const tests = await Test.findAll({
      attributes: ['category'],
      where: {
        category: { [Op.ne]: null }
      },
      raw: true
    });
    
    // 중복 제거
    const uniqueCategories = [...new Set(tests.map(test => test.category).filter(Boolean))];
    
    res.json(uniqueCategories);
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    // 오류 발생 시 빈 배열 반환
    res.json([]);
  }
});

// 인기 테스트 (조회수 기준)
app.get('/api/tests/popular', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const tests = await Test.findAll({
      order: [['views', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json(tests);
  } catch (error) {
    next(error);
  }
});

// 최신 테스트
app.get('/api/tests/latest', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const tests = await Test.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json(tests);
  } catch (error) {
    next(error);
  }
});

// 방문자 통계
app.get('/api/visitors/count', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const total = await Visitor.count();
    const todayCount = await Visitor.count({ 
      where: { visitedAt: { [Op.gte]: today } } 
    });
    
    // 주간 통계
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = await Visitor.count({
      where: { visitedAt: { [Op.gte]: weekAgo } }
    });
    
    res.json({ 
      total, 
      today: todayCount,
      week: weekCount
    });
  } catch (error) {
    next(error);
  }
});

// 방문자 기록
app.post('/api/visitors', async (req, res, next) => {
  try {
    const { country, region, testId } = req.body;
    const clientIP = getClientIP(req);
    
    await Visitor.create({
      ip: clientIP,
      country,
      region,
      userAgent: req.headers['user-agent'],
      testId
    });
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 테스트 통계
app.get('/api/stats', async (req, res, next) => {
  try {
    const totalTests = await Test.count();
    const totalViews = await Test.sum('views') || 0;
    const totalLikes = await Test.sum('likes') || 0;
    const totalComments = await Comment.count();
    
    res.json({
      totalTests,
      totalViews,
      totalLikes,
      totalComments,
      averageViews: Math.round(totalViews / totalTests) || 0
    });
  } catch (error) {
    next(error);
  }
});

// 에러 핸들링 미들웨어 적용
app.use(errorHandler);

// 서버 시작 및 DB 동기화
const PORT = process.env.PORT || 4000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}); 