import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import sequelize, { Test, Comment, Like, Visitor, LottoDraw } from './models/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import geoip from 'geoip-lite';
import { createRequire } from 'module';
import sitemapRouter from './routes/sitemap.js';
import { count } from 'console';
const require = createRequire(import.meta.url);
let REGION_MAP = {};
try {
  REGION_MAP = require('./utils/region-map.json');
} catch (e) {
  REGION_MAP = {};
  console.warn('region-map.json 파일을 찾을 수 없습니다. 직접 매핑이 비활성화됩니다.');
}
let regionNames = {};
try {
  regionNames = require('geoip-lite/regions.json');
} catch (e) {
  regionNames = {};
  console.warn('geoip-lite/regions.json 파일을 찾을 수 없습니다. 지역명 매핑이 비활성화됩니다.');
}

const execAsync = promisify(exec);



// multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), '..', 'frontend', 'public', 'uploads', 'thumbnails');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 파일명: testID_타임스탬프_안전한파일명
    const testId = req.params.id || 'temp';
    const timestamp = Date.now();
    
    // 원본 파일명에서 확장자 추출
    const ext = path.extname(file.originalname).toLowerCase();
    
    // 안전한 파일명 생성 (한글, 특수문자 제거)
    const safeName = `test${testId}_${timestamp}${ext}`;
    
    console.log('📁 파일명 생성:', {
      original: file.originalname,
      safe: safeName,
      testId,
      timestamp
    });
    
    cb(null, safeName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

dotenv.config();

const app = express();

// CORS 설정
app.use(cors({
  origin: ['https://smartpick.website', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-key'
  ]
}));

// 정적 파일 서빙 (업로드된 썸네일)
app.use('/uploads', express.static(path.join(process.cwd(), '..', 'frontend', 'public', 'uploads')));
// 빌드된 테스트 앱 정적 서빙
app.use('/tests', express.static(path.join(process.cwd(), '..', 'frontend', 'public', 'tests')));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 서버 상태 확인 라우트
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    adminToken: process.env.ADMIN_TOKEN ? '설정됨' : '설정되지 않음',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// 데이터베이스 상태 확인 라우트
app.get('/api/db-status', async (req, res) => {
  try {
    await sequelize.authenticate();
    const tests = await Test.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    const os = await import('os');
    
    res.json({
      dbConnection: 'ok',
      testCount: tests.length,
      tests: tests.map(test => ({
        id: test.id,
        title: test.title,
        description: test.description,
        category: test.category,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt
      })),
      systemInfo: {
        platform: os.default.platform(),
        arch: os.default.arch(),
        totalMemory: os.default.totalmem(),
        freeMemory: os.default.freemem(),
        cpus: os.default.cpus().length
      }
    });
  } catch (error) {
    console.error('데이터베이스 상태 확인 실패:', error);
    res.status(500).json({
      dbConnection: 'error',
      error: error.message
    });
  }
});

// 관리자 인증 미들웨어
const authenticateAdmin = (req, res, next) => {
  console.log('🔐 관리자 인증 시도');
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token === process.env.ADMIN_TOKEN) {
    console.log('✅ 관리자 인증 성공');
    next();
  } else {
    console.log('❌ 관리자 인증 실패');
    res.status(401).json({ error: '인증이 필요합니다.' });
  }
};

// IP 주소 추출 미들웨어
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

// 기존 getClientIP 함수 위에 추가 또는 대체
function getUserKeyOrIP(req) {
  return req.headers['x-user-key'] || getClientIP(req);
}

// test_deploy.sh 실행 함수
async function runTestDeployScript(clonePath) {
  const scriptPath = path.join(process.cwd(), '..', 'test_deploy.sh');
  try {
    const { stdout, stderr } = await execAsync(`bash ${scriptPath} ${clonePath}`, {
      timeout: 300000, // 5분
      maxBuffer: 1024 * 1024
    });
    console.log('✅ test_deploy.sh 실행 결과:', stdout);
    if (stderr) console.error('test_deploy.sh stderr:', stderr);
    return { success: true, stdout, stderr };
  } catch (error) {
    console.error('❌ test_deploy.sh 실행 실패:', error.message);
    return { success: false, error: error.message };
  }
}

// 모든 테스트 목록 가져오기
app.get('/api/tests', async (req, res, next) => {
  try {
    const { search, category, sort = 'latest', limit = 20, offset = 2 } = req.query;
    
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
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true, // 중복 제거
      attributes: { exclude: ['password'] } // 불필요한 필드 제외
    });
    
    console.log(`📊 테스트 목록 조회: ${tests.length}개 `);
    // 이미지 경로 수정 및 중복 제거
    const testsWithCorrectPaths = tests.map(test => {
      const testData = test.toJSON();
      return testData;
    });
    
    // 중복 제거 (id 기준) - 더 강화된 로직
    const uniqueTests = testsWithCorrectPaths.reduce((acc, test) => {
      const existingTest = acc.find(t => t.id === test.id);
      if (!existingTest) {
        acc.push(test);
      }
      return acc;
    }, []);
    
    console.log(`📊 테스트 목록 조회: ${uniqueTests.length}개 (중복 제거 후)`);
    res.json(uniqueTests);
  } catch (error) {
    next(error);
  }
});

// 테스트별 상세 정보
app.get('/api/tests/:id', async (req, res, next) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ error: '테스트를 찾을 수 없습니다.' });
    }
    
    // 조회수 증가 (IP 기반 중복 방지)
    const userKey = getUserKeyOrIP(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingView = await Visitor.findOne({
      where: {
        testId: req.params.id,
        ip: userKey,
        visitedAt: { [Op.gte]: today }
      }
    });
    
    if (!existingView) {
      await test.increment('views');
      await Visitor.create({
        ip: userKey,
        testId: req.params.id,
        userAgent: req.headers['user-agent']
      });
    }
    
    // 댓글 수 계산
    const commentCount = await Comment.count({ where: { testId: req.params.id } });
    
    // 사용자의 좋아요 상태 확인
    const userLike = await Like.findOne({
      where: { testId: req.params.id, ip: userKey, commentId: null }
    });
    
    // 이미지 경로 수정
    const testData = test.toJSON();
    testData.userLiked = !!userLike;
    res.json(testData);
  } catch (error) {
    next(error);
  }
});

// 좋아요 토글
app.post('/api/tests/:id/like', async (req, res, next) => {
  try {
    const userKey = getUserKeyOrIP(req);
    const testId = req.params.id;
    
    const existingLike = await Like.findOne({
      where: { testId, ip: userKey, commentId: null }
    });
    
    if (existingLike) {
      await existingLike.destroy();
      await Test.decrement('likes', { where: { id: testId } });
      res.json({ liked: false, message: '좋아요가 취소되었습니다.' });
    } else {
      await Like.create({ testId, ip: userKey });
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
    const userKey = getUserKeyOrIP(req);
    
    const comments = await Comment.findAndCountAll({
      where: { testId: req.params.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const commentsWithStatus = await Promise.all(
      comments.rows.map(async (comment) => {
        const commentData = comment.toJSON();
        delete commentData.password;
        
        const userLike = await Like.findOne({
          where: { commentId: comment.id, ip: userKey }
        });
        
        return {
          ...commentData,
          userLiked: !!userLike
        };
      })
    );
    
    res.json({
      comments: commentsWithStatus,
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
    const { nickname, content, password } = req.body;
    
    if (!nickname || !content || !password) {
      return res.status(400).json({ error: '닉네임, 내용, 비밀번호를 모두 입력해주세요.' });
    }
    
    if (content.length > 500) {
      return res.status(400).json({ error: '댓글은 500자 이내로 작성해주세요.' });
    }
    
    if (password.length < 4) {
      return res.status(400).json({ error: '비밀번호는 4자 이상 입력해주세요.' });
    }
    
    const userKey = getUserKeyOrIP(req);
    const comment = await Comment.create({
      testId: req.params.id,
      nickname: nickname.trim(),
      content: content.trim(),
      password: password,
      ip: userKey
    });
    
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// 댓글 좋아요 토글
app.post('/api/comments/:id/like', async (req, res, next) => {
  try {
    const userKey = getUserKeyOrIP(req);
    const commentId = req.params.id;
    
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }
    
    const existingLike = await Like.findOne({
      where: { commentId, ip: userKey }
    });
    
    if (existingLike) {
      await existingLike.destroy();
      res.json({ liked: false });
    } else {
      await Like.create({ 
        commentId, 
        ip: userKey,
        testId: comment.testId
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('댓글 좋아요 오류:', error);
    res.status(500).json({ error: '댓글 좋아요 처리 중 오류가 발생했습니다.' });
  }
});

// 카테고리 목록
app.get('/api/categories', async (req, res, next) => {
  try {
    const tests = await Test.findAll({
      attributes: ['category'],
      where: {
        category: { [Op.ne]: null }
      },
      raw: true
    });
    
    const uniqueCategories = [...new Set(tests.map(test => test.category).filter(Boolean))];
    res.json(uniqueCategories);
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    res.json([]);
  }
});


// 추천 목록
app.get('/api/tests/:id/recommends/', async (req, res, next) => {
  try {
    const { search, category, sort = 'latest', limit = 10 } = req.query;
    
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
    
    let orderClause = [['views', 'DESC'], ['likes', 'DESC']];
    //if (sort === 'views') orderClause = [['views', 'DESC']];
    //if (sort === 'likes') orderClause = [['likes', 'DESC']];
    //if (sort === 'popular') orderClause = [['views', 'DESC'], ['likes', 'DESC']];
    
    const tests = await Test.findAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit),
      distinct: true, // 중복 제거
      attributes: { exclude: ['password'] } // 불필요한 필드 제외
    });
    
    // 이미지 경로 수정 및 중복 제거
    const testsWithCorrectPaths = tests.map(test => {
      const testData = test.toJSON();
      return testData;
    });
    
    // 중복 제거 (id 기준) - 더 강화된 로직
    const uniqueTests = testsWithCorrectPaths.reduce((acc, test) => {
      const existingTest = acc.find(t => t.id === test.id);
      if (!existingTest) {
        acc.push(test);
      }
      return acc;
    }, []);
    
    console.log(`📊 추천 테스트 목록 조회: ${uniqueTests.length}개 (중복 제거 후)`);
    res.json(uniqueTests);
  } catch (error) {
    next(error);
  }
});
// 댓글 작성
app.get('/api/recommends', async (req, res, next) => {
  try {
    const { search, category, sort = 'latest', limit = 10 } = req.query;
    
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
    
    let orderClause = [['views', 'DESC'], ['likes', 'DESC']];
    //if (sort === 'views') orderClause = [['views', 'DESC']];
    //if (sort === 'likes') orderClause = [['likes', 'DESC']];
    //if (sort === 'popular') orderClause = [['views', 'DESC'], ['likes', 'DESC']];
    
    const tests = await Test.findAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit),
      distinct: true, // 중복 제거
      attributes: { exclude: ['password'] } // 불필요한 필드 제외
    });
    
    // 이미지 경로 수정 및 중복 제거
    const testsWithCorrectPaths = tests.map(test => {
      const testData = test.toJSON();
      return testData;
    });
    
    // 중복 제거 (id 기준) - 더 강화된 로직
    const uniqueTests = testsWithCorrectPaths.reduce((acc, test) => {
      const existingTest = acc.find(t => t.id === test.id);
      if (!existingTest) {
        acc.push(test);
      }
      return acc;
    }, []);
    
    console.log(`📊 추천 테스트 목록 조회: ${uniqueTests.length}개 (중복 제거 후)`);
    res.json(uniqueTests);
  } catch (error) {
    next(error);
  }
});


// 방문자 통계
app.get('/api/visitors/count', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const total = await Visitor.count({ distinct: true, col: 'ip' });
    const todayCount = await Visitor.count({ 
      where: { visitedAt: { [Op.gte]: today } },
      distinct: true,
      col: 'ip'
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = await Visitor.count({
    where: { visitedAt: { [Op.gte]: weekAgo } },
    distinct: true,
    col: 'ip'
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
    const userKey = getUserKeyOrIP(req);
    if (!userKey) return res.status(400).json({ error: 'IP를 확인할 수 없습니다.' });
    const geo = geoip.lookup(userKey);
    const country = geo ? geo.country : null;
    let region = geo ? geo.region : null;
    
    console.log('Visitor:', userKey,'country:', country, 'region:', region); // userKey 값 로그
    // 1. region-map.json 우선 적용
    if (country && region && REGION_MAP[country] && REGION_MAP[country][region]) {
      region = REGION_MAP[country][region];
    } else if (country === 'KR' && region && regionNames['KR'] && regionNames['KR'][region]) {
      // 2. geoip-lite/regions.json (한국만)
      region = regionNames['KR'][region];
    }
    const { testId, userAgent, page, duration } = req.body;
    const visitor = await Visitor.create({
      testId,
      ip: userKey,
      country,
      region,
      userAgent,
      visitedAt: new Date(),
      page,
      duration
    });
    //res.json({ success: true, visitor });
    res.json({ success: true });
  } catch (error) {
    console.error('Visitor insert error:', error); // 전체 에러 로그
    res.status(500).json({ error: 'DB insert 실패', detail: error.message });
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

// 댓글 삭제
app.delete('/api/comments/:id', async (req, res, next) => {
  try {
    const { password } = req.body;
    const commentId = req.params.id;
    
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }
    
    if (!comment.password) {
      const userKey = getUserKeyOrIP(req);
      if (comment.ip !== userKey) {
        return res.status(403).json({ error: '댓글을 삭제할 권한이 없습니다.' });
      }
    } else {
      if (!password) {
        return res.status(400).json({ error: '비밀번호를 입력해주세요.' });
      }
      
      if (comment.password !== password) {
        return res.status(403).json({ error: '비밀번호가 일치하지 않습니다.' });
      }
    }
    
    await Like.destroy({ where: { commentId } });
    await comment.destroy();
    
    res.json({ success: true, message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    next(error);
  }
});

// 관리자 로그인
app.post('/api/admin/login', async (req, res, next) => {
  try {
    console.log('🔐 관리자 로그인 시도');
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      console.log('✅ 로그인 성공');
      res.json({ 
        token: process.env.ADMIN_TOKEN,
        message: '로그인 성공'
      });
    } else {
      console.log('❌ 로그인 실패');
      res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }
  } catch (error) {
    console.error('❌ 로그인 오류:', error);
    next(error);
  }
});

// 새 테스트 추가 (폴더명/경로 싱크 구조)
app.post('/api/admin/tests/add', authenticateAdmin, async (req, res, next) => {
  console.log('🎯 POST /api/admin/tests/add (폴더명 싱크 구조)');
  const steps = {
    directoryCreated: false,
    gitCloned: false,
    packageJsonModified: false,
    npmInstalled: false,
    buildCompleted: false,
    databaseSaved: false,
    thumbnailReady: false
  };
  let test = null; // 생성된 테스트 객체 추적
  try {
    // 1. DB에 insert (임시 folder: null)
    const { gitUrl, title, description, category } = req.body;
    if (!gitUrl || !title) {
      return res.status(400).json({ error: 'Git URL과 제목은 필수입니다.', steps });
    }
    if (!gitUrl.includes('github.com') && !gitUrl.includes('gitlab.com')) {
      return res.status(400).json({ error: 'GitHub 또는 GitLab 저장소만 지원합니다.', steps });
    }
    let thumbnailPath = '/uploads/thumbnails/default-thumb.png';
    try {
      test = await Test.create({
        title,
        description: description || '',
        category: category || '기타',
        thumbnail: thumbnailPath,
        folder: 'test',
      });
      steps.databaseSaved = true;
    } catch (error) {
      return res.status(500).json({ error: 'DB 저장 실패', steps, detail: error.message });
    }
    // 2. 실제 id로 폴더명 생성
    const folderName = `test${test.id}`;
    test.folder = folderName;
    // testGroup 경로로 변경
    const testsDir = path.join(process.cwd(), '..', 'testGroup', 'public', 'tests');
    const testPath = path.join(testsDir, folderName);
    // 기존 폴더가 있으면 삭제
    if (fs.existsSync(testPath)) {
      try {
        fs.rmSync(testPath, { recursive: true, force: true });
        console.log('🗑️ 기존 폴더 삭제:', testPath);
      } catch (error) {
        console.error('⚠️ 기존 폴더 삭제 실패:', error.message);
        // 삭제 실패 시 폴더 내용만 비우기
        try {
          const files = fs.readdirSync(testPath);
          for (const file of files) {
            const filePath = path.join(testPath, file);
            if (fs.lstatSync(filePath).isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(filePath);
            }
          }
          console.log('🗑️ 폴더 내용 비우기 완료:', testPath);
        } catch (clearError) {
          console.error('⚠️ 폴더 내용 비우기 실패:', clearError.message);
        }
      }
    }
    // git clone
    try {
      // 1. 임시 폴더 생성 (예: /tmp/psycho_build_{folderName}_{timestamp})
      const os = require('os');
      const tmpBase = testsDir;
      const timestamp = Date.now();
      const tmpBuildPath = path.join(tmpBase, `psycho_build_${folderName}_${timestamp}`);
      //fs.mkdirSync(tmpBuildPath, { recursive: true });
      const logFile = path.join(tmpBuildPath, 'psycho_build.log');
      function log(msg) {
        const time = new Date().toISOString();
        fs.appendFileSync(logFile, `[${time}] ${msg}\n`);
        console.log(msg);
      }
      try {
        // 2. git clone
        log(`git clone ${gitUrl} ${tmpBuildPath}`);
        await execAsync(`git clone ${gitUrl} ${tmpBuildPath}`, { timeout: 300000 });

        // 3. package.json homepage 수정
        const packageJsonPath = path.join(tmpBuildPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          packageJson.homepage = `/tests/${folderName}/`;
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          log('package.json homepage 필드 수정 완료');
        } else {
          log('package.json 없음');
          if (test) await test.destroy();
          return res.status(400).json({ error: 'package.json 없음', steps, path: packageJsonPath });
        }

        // 4. vite.config.js base 설정 추가
        const viteConfigPath = path.join(tmpBuildPath, 'vite.config.js');
        if (fs.existsSync(viteConfigPath)) {
          let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
          if (!viteConfig.includes('base:')) {
            viteConfig = viteConfig.replace(
              /defineConfig\s*\(\s*{/, 
              `defineConfig({\n  base: '/tests/${folderName}/',`
            );
            fs.writeFileSync(viteConfigPath, viteConfig);
            log('vite.config.js base 설정 추가 완료');
          } else {
            log('vite.config.js base 설정 이미 존재');
          }
        } else {
          log('vite.config.js 없음');
        }

        // 5. (Browser)Router basename 자동치환
        const appFiles = ['src/App.jsx', 'src/App.js'];
        for (const appFile of appFiles) {
          const appPath = path.join(tmpBuildPath, appFile);
          if (fs.existsSync(appPath)) {
            let appCode = fs.readFileSync(appPath, 'utf8');
            // <Router> → <Router basename="/tests/폴더명">
            appCode = appCode.replace(
              /<Router>/g,
              `<Router basename=\"/tests/${folderName}\">`
            );
            // <BrowserRouter> → <BrowserRouter basename="/tests/폴더명">
            appCode = appCode.replace(
              /<BrowserRouter>/g,
              `<BrowserRouter basename=\"/tests/${folderName}\">`
            );
            // BrowserRouter import 없으면 추가
            if (appCode.includes('<BrowserRouter') && !appCode.includes('import { BrowserRouter')) {
              appCode = `import { BrowserRouter } from \"react-router-dom\";\n` + appCode;
            }
            fs.writeFileSync(appPath, appCode);
            log(`${appFile} Router/Basename 자동치환 완료`);
          }
        }

        // 6. npm install/build
        log('npm install 시작');
        await execAsync(`nice -n 19 npm install --legacy-peer-deps`, { cwd: tmpBuildPath, timeout: 300000 });
        log('npm install 완료');
        log('npm run build 시작');
        await execAsync(`nice -n 19 npm run build`, { cwd: tmpBuildPath, timeout: 300000 });
        log('npm run build 완료');

        // 7. 빌드 결과물 복사
        const buildPath = path.join(tmpBuildPath, 'build');
        if (fs.existsSync(buildPath)) {
          if (!fs.existsSync(testPath)) fs.mkdirSync(testPath, { recursive: true });
          fs.rmSync(testPath, { recursive: true, force: true });
          fs.mkdirSync(testPath, { recursive: true });
          // 빌드 결과물 복사 (copyRecursiveSync 함수 사용)
          const copyRecursiveSync = (src, dest) => {
            const entries = fs.readdirSync(src, { withFileTypes: true });
            for (const entry of entries) {
              const srcPath = path.join(src, entry.name);
              const destPath = path.join(dest, entry.name);
              if (entry.isDirectory()) {
                if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
                copyRecursiveSync(srcPath, destPath);
              } else {
                fs.copyFileSync(srcPath, destPath);
              }
            }
          };
          copyRecursiveSync(buildPath, testPath);
          log('빌드 결과물 복사 완료');
        } else {
          log('빌드 결과물(build 폴더)이 없습니다.');
          if (test) await test.destroy();
          return res.status(400).json({ error: '빌드 결과물(build 폴더)이 없습니다.', steps });
        }

        // 8. 임시 폴더 삭제
        try {
          fs.rmSync(tmpBuildPath, { recursive: true, force: true });
          log('임시 폴더 삭제 완료');
        } catch (e) {
          log('임시 폴더 삭제 실패(무시)');
        }
      } catch (error) {
        log(`에러 발생: ${error.message}`);
        if (test) await test.destroy();
        return res.status(500).json({ error: '서버 오류', steps, detail: error.message });
      }
    } catch (error) {
      if (test) await test.destroy();
      return res.status(400).json({ error: '테스트 빌드/복사 실패', steps, detail: error.message });
    }
    // 3. folder 컬럼 업데이트
    test.folder = folderName;
    await test.save();
    return res.json({ success: true, test, steps, folderName });
  } catch (error) {
    if (test) await test.destroy();
    return res.status(500).json({ error: '서버 오류', steps, detail: error.message });
  }
});
// 템플릿 테스트 등록 (git clone + css 제외 복사)
app.post('/api/admin/tests/template', authenticateAdmin, async (req, res) => {
  let steps = {
    directoryCreated: false,
    gitCloned: false,
    filesCopied: false,
    packageJsonModified: false,
    npmInstalled: false,
    buildCompleted: false,
    databaseSaved: false,
    thumbnailReady: false
  };
  let test = null;
  try {
    console.log('템플릿 적용 시작');
    const { gitUrl, title, description, category } = req.body;
    if (!gitUrl || !title) {
      return res.status(400).json({ error: 'Git URL과 제목은 필수입니다.', steps });
    }
    let url = gitUrl.endsWith('.git') ? gitUrl : gitUrl + '.git';
    let thumbnailPath = '/uploads/thumbnails/default-thumb.png';
    // 1. DB에 insert (임시 folder: null)
    try {
      test = await Test.create({
        title,
        folder: 'template',
        description: description || '',
        category: category || '기타',
        thumbnail: thumbnailPath,
      });
      console.log('테스트 req data:', test);
      steps.databaseSaved = true;
    } catch (error) {
      console.log('DB 에러');
      return res.status(500).json({ error: 'DB 저장 실패', steps, detail: error.message });
    }
    // 2. 실제 id로 폴더명 생성 (템플릿 테스트는 다른 폴더명 사용)
    const folderName = `template${test.id}`;
    test.folder = folderName;
    const testsDir = path.join(process.cwd(), '..', 'frontend', 'tests');
    const testPath = path.join(testsDir, folderName);
    const tmpDir = path.join(process.cwd(), '..', 'tmp-template-' + Date.now());
    console.log(testsDir ,testPath, tmpDir);
    // 기존 폴더가 있으면 삭제
    if (fs.existsSync(testPath)) {
      try { fs.rmSync(testPath, { recursive: true, force: true }); } catch {}
    }
    if (fs.existsSync(tmpDir)) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    }
    // 3. git clone (임시 폴더)
    try {
      
      console.log(`git clone ${url} ${tmpDir}`);
      await execAsync(`git clone ${url} ${tmpDir}`, { timeout: 300000 });
      steps.gitCloned = true;
    } catch (error) {
      if (test) await test.destroy();
      console.log(`Git 클론 실패`);
      return res.status(400).json({ error: 'Git 클론 실패', steps, detail: error.message });
    }
    // 4. css 파일 제외 전체 복사 함수
    function copyExceptCss(src, dest) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      const items = fs.readdirSync(src, { withFileTypes: true });
      // 제외할 확장자/파일명/패턴 목록
      const excludePatterns = [
        '.css', '.txt', '.md', '.html',
        'App.test.js', 'index', 'setupTests.js', 'README.md', 'index.html', 'MobileTestApp.jsx'
      ];

      // App.js, App.tsx, App.jsx 파일 존재 여부 확인
      const hasAppJs = items.some(item => item.name === 'App.js');
      const hasAppTsx = items.some(item => item.name === 'App.tsx');
      const hasAppJsx = items.some(item => item.name === 'App.jsx');

      for (const item of items) {
        const srcPath = path.join(src, item.name);
        const destPath = path.join(dest, item.name);
        if (item.isDirectory()) {
          // 디렉토리 이름이 제외 패턴에 포함되면 건너뜀
          if (excludePatterns.some(pattern => item.name.includes(pattern))) continue;
          copyExceptCss(srcPath, destPath);
        } else {
          // 파일 이름이 제외 패턴에 포함되면 복사하지 않음
          if (excludePatterns.some(pattern => item.name.includes(pattern))) continue;
          fs.copyFileSync(srcPath, destPath);
        }
      }

      // App.jsx가 없고 App.js가 있으면 App.js를 App.jsx로 복사
      if (!hasAppJsx && hasAppJs) {
        const appJsPath = path.join(src, 'App.js');
        const appJsxPath = path.join(dest, 'App.jsx');
        if (fs.existsSync(appJsPath)) {
          fs.copyFileSync(appJsPath, appJsxPath);
        }
      }
      // App.jsx가 없고 App.tsx가 있으면 App.tsx를 App.jsx로 복사
      if (!hasAppJsx && hasAppTsx) {
        const appTsxPath = path.join(src, 'App.tsx');
        const appJsxPath = path.join(dest, 'App.jsx');
        if (fs.existsSync(appTsxPath)) {
          fs.copyFileSync(appTsxPath, appJsxPath);
        }
      }
    }
    // 5. 복사 실행 (임시폴더 전체 → test폴더, css 제외)
    try {
      copyExceptCss(tmpDir, testPath);
      steps.filesCopied = true;
    } catch (error) {
      if (test) await test.destroy();
      
      console.log(`파일 복사 실패`);
      return res.status(500).json({ error: '파일 복사 실패', steps, detail: error.message });
    }
    // 6. package.json 수정 (기존 로직과 동일)
    const packageJsonPath = path.join(testPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson.homepage = `/tests/${folderName}/`;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        steps.packageJsonModified = true;
      } catch (error) {
        if (test) await test.destroy();
        
       console.log(`package.json 수정 실패`);
        return res.status(500).json({ error: 'package.json 수정 실패', steps, detail: error.message });
      }
    } else {
      if (test) await test.destroy();
      return res.status(400).json({ error: 'package.json 없음', steps, path: packageJsonPath });
    }
    // 7. test_deploy.sh 실행
    try {
      const scriptPath = path.join(process.cwd(), '..', 'test_deploy.sh');
      //await execAsync(`bash ${scriptPath} ${folderName}`, { cwd: testsDir });
      steps.npmInstalled = true;
      steps.buildCompleted = true;
    } catch (error) {
      if (test) await test.destroy();
      return res.status(400).json({ error: '테스트 배포 스크립트 실패', steps, detail: error.message });
    }
    // 8. folder 컬럼 업데이트
    test.folder = folderName;
    console.log('DB 폴더:'+test.folder+' | 입력 폴더:'+folderName);
    await test.save();
    // 9. 임시폴더 삭제
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    try {
      // frontend/scripts/generate-app-module-map.js 실행
      exec('node ../frontend/scripts/generate-app-module-map.js', { stdio: 'inherit' });
    } catch (e) {
      console.error('generate-app-module-map 생성 스크립트 실행 실패:', e);
    }
    return res.json({ success: true, test, steps, folderName });
  } catch (error) {
    if (test) await test.destroy();
    return res.status(500).json({ error: '서버 오류', steps, detail: error.message });
  }
});
// 테스트 목록 (관리자용)
app.get('/api/admin/tests', authenticateAdmin, async (req, res, next) => {
  console.log('🎯 GET /api/admin/tests 핸들러 실행됨');
  
  try {
    console.log('=== 관리자 테스트 목록 요청 ===');
    
    const tests = await Test.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    console.log('✅ 테스트 목록 조회 성공:', tests.length, '개');
    console.log('테스트 목록:', tests.map(t => ({ id: t.id, title: t.title })));
    
    res.json(tests);
  } catch (error) {
    console.error('❌ 테스트 목록 조회 실패:', error);
    next(error);
  }
});

// 관리자용 개별 테스트 조회
app.get('/api/admin/tests/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ error: '테스트를 찾을 수 없습니다.' });
    }
    
    // 이미지 경로 수정
    const testData = test.toJSON();
    res.json(testData);
  } catch (error) {
    console.error('❌ 관리자 테스트 조회 실패:', error);
    next(error);
  }
});

// 썸네일 업로드 라우트
app.post('/api/admin/tests/:id/thumbnail', authenticateAdmin, upload.single('thumbnail'), async (req, res, next) => {
  try {
    console.log('🎯 썸네일 업로드 요청 시작');
    console.log('요청 파일:', req.file);
    console.log('요청 파라미터:', req.params);
    
    const testId = req.params.id;
    if (!req.file) {
      console.error('❌ 썸네일 파일이 없음');
      return res.status(400).json({ error: '썸네일 파일이 필요합니다.' });
    }
    
    console.log('📁 업로드된 파일 정보:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      filename: req.file.filename
    });
    
    const test = await Test.findByPk(testId);
    if (!test) {
      console.error('❌ 테스트를 찾을 수 없음:', testId);
      return res.status(404).json({ error: '테스트를 찾을 수 없습니다.' });
    }
    
    // 파일이 이미 올바른 위치에 있으므로 경로만 설정
    const thumbnailPath = `/uploads/thumbnails/${req.file.filename}`;
    
    console.log('📂 썸네일 경로:', thumbnailPath);
    
    // 기존 썸네일 삭제 (기본 썸네일 제외)
    if (test.thumbnail && test.thumbnail !== '/uploads/thumbnails/default-thumb.png') {
      try {
        const oldThumbPath = path.join(process.cwd(), '..', 'frontend', 'public', test.thumbnail.replace('/', ''));
        if (fs.existsSync(oldThumbPath)) {
          fs.unlinkSync(oldThumbPath);
          console.log('🗑️ 기존 썸네일 삭제:', oldThumbPath);
        }
      } catch (error) {
        console.error('⚠️ 기존 썸네일 삭제 실패:', error.message);
      }
    }
    
    test.thumbnail = thumbnailPath;
    await test.save();
    
    console.log('✅ 썸네일 업데이트 완료:', thumbnailPath);
    res.json({ success: true, message: '썸네일이 업데이트되었습니다.', thumbnail: thumbnailPath });
  } catch (error) {
    console.error('❌ 썸네일 업로드 전체 오류:', error.message);
    next(error);
  }
});

// 실시간 로그 API
app.get('/api/admin/tests/:repo/log', authenticateAdmin, (req, res) => {
  const repo = req.params.repo;
  const logPath = path.join(process.cwd(), '..', 'frontend', 'public', 'tests', repo, 'deploy.log');
  if (fs.existsSync(logPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    fs.createReadStream(logPath).pipe(res);
  } else {
    res.status(404).send('로그 파일이 없습니다.');
  }
});

// 방문자 통계 (상세)
app.get('/api/admin/analytics', authenticateAdmin, async (req, res, next) => {
  try {
    const { period = 'day', limit = 30, start, end } = req.query;
    let startDate = new Date();
    let groupBy = 'DATE(CONVERT_TZ(visitedAt, "+00:00", "+09:00"))';
    let endDate = null;
    if (end) {
      endDate = new Date(end);
      if (end.length === 10) {
        endDate.setHours(23, 59, 59, 999);
      }
    }
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        groupBy = 'YEARWEEK(CONVERT_TZ(visitedAt, "+00:00", "+09:00"))';
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        groupBy = 'DATE_FORMAT(CONVERT_TZ(visitedAt, "+00:00", "+09:00"), "%Y-%m")';
        break;
      default:
        startDate.setDate(startDate.getDate() - limit);
        break;
    }
    let whereClause = 'visitedAt >= ?';
    let params = [startDate];
    if (endDate) {
      whereClause += ' AND visitedAt <= ?';
      params.push(endDate);
    }
    const visitors = await sequelize.query(`
      SELECT 
        ${groupBy} as date,
        COUNT(*) as count
      FROM Visitors 
      WHERE ${whereClause}
      GROUP BY ${groupBy}
      ORDER BY date DESC
      LIMIT ?
    `, {
      replacements: [...params, parseInt(limit)],
      type: sequelize.QueryTypes.SELECT
    });
    // 오늘 날짜가 결과에 없으면 count 0으로 추가
    const todayStr = new Date().toISOString().slice(0, 10);
    if (period === 'day' && !visitors.some(v => v.date.startsWith(todayStr))) {
      visitors.unshift({ date: todayStr, count: 0 });
    }
    res.json(visitors);
  } catch (error) {
    next(error);
  }
});

// 국가별 방문자수 집계 API
app.get('/api/admin/analytics-country', authenticateAdmin, async (req, res, next) => {
  try {
    const { start, end } = req.query;
    let where = {};
    if (start) where.visitedAt = { [Op.gte]: new Date(start) };
    if (end) {
      where.visitedAt = where.visitedAt || {};
      where.visitedAt[Op.lte] = new Date(end);
    }
    // 국가별 집계
    const countryStats = await Visitor.findAll({
      attributes: [
        'country',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where,
      group: ['country'],
      order: [[sequelize.literal('count'), 'DESC']]
    });
    res.json(countryStats);
  } catch (error) {
    next(error);
  }
});

// 방문자 상세 로그 (isBot 필드 추가)
app.get('/api/admin/visitors', authenticateAdmin, async (req, res, next) => {
  try {
    const { start, end } = req.query;
    let where = {};
    if (start) where.visitedAt = { [Op.gte]: new Date(start) };
    if (end) {
      let endDate = new Date(end);
      if (end.length === 10) {
        endDate.setHours(23, 59, 59, 999);
      }
      where.visitedAt = where.visitedAt || {};
      where.visitedAt[Op.lte] = endDate;
    }
    const visitors = await Visitor.findAll({
      attributes: ['id', 'country', 'region', 'ip', 'userAgent', 'visitedAt', 'testId'],
      include: [{
        model: Test,
        attributes: ['title']
      }],
      where,
      order: [['visitedAt', 'DESC']]
    });
    // userAgent로 봇 여부 판별
    const isBot = (ua) => {
      if (!ua) return false;
      const botKeywords = ['bot', 'spider', 'crawl', 'slurp', 'baidu', 'bing', 'duckduck', 'yeti', 'naver', 'daum', 'googlebot'];
      return botKeywords.some(k => ua.toLowerCase().includes(k));
    };
    const visitorsWithBot = visitors.map(v => {
      const vObj = v.toJSON();
      vObj.isBot = isBot(vObj.userAgent);
      return vObj;
    });
    // ip가 UUID(x-user-key) 형식이면 제외
    const filteredRows = visitorsWithBot.filter(v => !/^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(v.ip));
    res.json({
      visitors: filteredRows,
      total: filteredRows.length
    });
  } catch (error) {
    next(error);
  }
});

// 테스트 삭제
app.delete('/api/admin/tests/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const testId = req.params.id;
    console.log('테스트 삭제 요청:', testId);
    const test = await Test.findByPk(testId);
    if (!test) {
      return res.status(404).json({ error: '테스트를 찾을 수 없습니다.' });
    }
    // 관련 데이터 삭제 (댓글, 좋아요, 방문자 기록)
    await Comment.destroy({ where: { testId } });
    await Like.destroy({ where: { testId } });
    // 테스트 폴더 삭제
    if (test.folder) {
      const testFolderPath = path.join(process.cwd(), '..', 'frontend', 'public', 'tests', test.folder);
      if (fs.existsSync(testFolderPath)) {
        fs.rmSync(testFolderPath, { recursive: true, force: true });
        console.log('🗑️ 테스트 폴더 삭제:', testFolderPath);
      }
    }
    // 썸네일 파일 삭제 (기본 썸네일 제외)
    if (test.thumbnail && test.thumbnail !== '/uploads/thumbnails/default-thumb.png') {
      const thumbPath = path.join(process.cwd(), '..', 'frontend', 'public', test.thumbnail.replace('/', ''));
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
        console.log('🗑️ 썸네일 파일 삭제:', thumbPath);
      }
    }
    // 테스트 삭제
    await test.destroy();
    // 필요 없는 썸네일 파일 정리 (어떤 테스트와도 연결되지 않은 파일)
    const usedThumbnails = new Set((await Test.findAll({ attributes: ['thumbnail'], raw: true })).map(t => t.thumbnail));
    const thumbsDir = path.join(process.cwd(), '..', 'frontend', 'public', 'uploads', 'thumbnails');
    if (fs.existsSync(thumbsDir)) {
      const files = fs.readdirSync(thumbsDir);
      for (const file of files) {
        const relPath = `/uploads/thumbnails/${file}`;
        if (!usedThumbnails.has(relPath) && file !== 'default-thumb.png') {
          try {
            fs.unlinkSync(path.join(thumbsDir, file));
            console.log('🗑️ 불필요한 썸네일 파일 삭제:', file);
          } catch (e) {
            console.error('⚠️ 불필요한 썸네일 삭제 실패:', file, e.message);
          }
        }
      }
    }
    console.log('테스트 삭제 완료:', testId);
    res.json({ success: true, message: '테스트가 삭제되었습니다.' });
  } catch (error) {
    console.error('테스트 삭제 오류:', error);
    next(error);
  }
});

// 테스트 수정
app.put('/api/admin/tests/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const testId = req.params.id;
    const { title, description, category } = req.body;
    
    console.log('테스트 수정 요청:', testId, req.body);
    
    const test = await Test.findByPk(testId);
    if (!test) {
      return res.status(404).json({ error: '테스트를 찾을 수 없습니다.' });
    }
    
    // 필수 필드 검증
    if (!title || !description) {
      return res.status(400).json({ error: '제목과 설명은 필수입니다.' });
    }
    
    // 테스트 정보 업데이트
    test.title = title;
    test.description = description;
    test.category = category || '기타';
    await test.save();
    
    console.log('✅ 테스트 수정 완료:', testId);
    res.json({ success: true, message: '테스트가 수정되었습니다.', test });
  } catch (error) {
    console.error('❌ 테스트 수정 오류:', error);
    next(error);
  }
});

// 기존 테스트 썸네일 경로 업데이트 (일회성)
app.post('/api/admin/update-thumbnail-paths', authenticateAdmin, async (req, res, next) => {
  try {
    console.log('🔄 기존 테스트 썸네일 경로 업데이트 시작');
    
    const tests = await Test.findAll();
    let updatedCount = 0;
    
    for (const test of tests) {
      let needsUpdate = false;
      
      // 기본 썸네일 경로 수정
      if (test.thumbnail === '/default-thumb.png') {
        test.thumbnail = '/uploads/thumbnails/default-thumb.png';
        needsUpdate = true;
        console.log(`📝 테스트 ${test.id} 기본 썸네일 경로 업데이트`);
      }
      
      // uploads 경로가 없는 경우 추가
      if (test.thumbnail && test.thumbnail.startsWith('/uploads/')) {
        test.thumbnail = test.thumbnail.replace('/uploads/', '/uploads/');
        needsUpdate = true;
        console.log(`📝 테스트 ${test.id} uploads 경로 업데이트`);
      }
      
      if (needsUpdate) {
        await test.save();
        updatedCount++;
      }
    }
    
    console.log(`✅ ${updatedCount}개 테스트 썸네일 경로 업데이트 완료`);
    res.json({ 
      success: true, 
      message: `${updatedCount}개 테스트의 썸네일 경로가 업데이트되었습니다.`,
      updatedCount 
    });
  } catch (error) {
    console.error('❌ 썸네일 경로 업데이트 실패:', error);
    next(error);
  }
});

// 다음 테스트 폴더명을 반환하는 엔드포인트
app.get('/api/admin/tests/next-id', authenticateAdmin, async (req, res, next) => {
  try {
    // 다음 id 구하기 (id가 AUTO_INCREMENT라면)
    const maxId = await Test.max('id');
    const nextId = (maxId || 0) + 1;
    const folderName = `test${nextId}`;
    res.json({ nextId, folderName });
  } catch (error) {
    console.error('다음 테스트 id 조회 실패:', error);
    res.status(500).json({ error: '다음 테스트 id 조회 실패', detail: error.message });
  }
});

// 등록되지 않은 테스트 폴더 정리 API
app.post('/api/admin/cleanup-orphan-folders', authenticateAdmin, async (req, res, next) => {
  try {
    console.log('🧹 등록되지 않은 테스트 폴더 정리 시작');
    // DB에 등록된 테스트 폴더 목록 (null/빈값은 id값으로 추정)
    const tests = await Test.findAll({ attributes: ['id', 'folder'], raw: true });
    const registeredFolders = new Set();
    for (const t of tests) {
      if (t.folder && t.folder.trim()) {
        registeredFolders.add(t.folder.trim());
      } else {
        // folder가 null/빈값이면 id값으로 폴더명 추정
        registeredFolders.add(`test${t.id}`);
      }
    }
    // 파일시스템의 테스트 폴더 목록
    const testsDir = path.join(process.cwd(), '..', 'frontend', 'public', 'tests');
    const filesystemFolders = fs.existsSync(testsDir) 
      ? fs.readdirSync(testsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
      : [];
    // 보호 폴더: DB에 등록된 폴더(또는 id값 추정) 중 실제로 존재하는 폴더만 보호
    const protectedFolders = new Set(
      Array.from(registeredFolders).filter(folder => filesystemFolders.includes(folder))
    );
    // 삭제 대상: 파일시스템에 있지만 protectedFolders에 없는 폴더
    const orphanFolders = filesystemFolders.filter(folder => !protectedFolders.has(folder));
    console.log('📁 보호 폴더:', Array.from(protectedFolders));
    console.log('🗑️ 정리 대상 폴더:', orphanFolders);
    // 삭제
    let deletedCount = 0;
    for (const folder of orphanFolders) {
      try {
        const folderPath = path.join(testsDir, folder);
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log('🗑️ 등록되지 않은 폴더 삭제:', folder);
        deletedCount++;
      } catch (error) {
        console.error('⚠️ 폴더 삭제 실패:', folder, error.message);
      }
    }
    res.json({ 
      success: true, 
      message: `${deletedCount}개 등록되지 않은 폴더가 정리되었습니다.`,
      deletedCount,
      orphanFolders
    });
  } catch (error) {
    console.error('❌ 등록되지 않은 폴더 정리 실패:', error);
    // 명확한 에러 메시지 반환
    res.status(500).json({ 
      success: false,
      message: '등록되지 않은 폴더 정리 중 오류 발생',
      error: error.message || error.toString()
    });
  }
});

// 등록되지 않은 폴더 목록 조회 API
app.get('/api/admin/orphan-folders', authenticateAdmin, async (req, res, next) => {
  try {
    const registeredFolders = new Set(
      (await Test.findAll({ attributes: ['folder'], raw: true }))
        .map(t => t.folder)
        .filter(Boolean)
    );
    
    const testsDir = path.join(process.cwd(), '..', 'frontend', 'public', 'tests');
    const filesystemFolders = fs.existsSync(testsDir) 
      ? fs.readdirSync(testsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
      : [];
    
    const orphanFolders = filesystemFolders.filter(folder => !registeredFolders.has(folder));
    
    res.json({ 
      orphanFolders,
      totalOrphans: orphanFolders.length,
      registeredFolders: Array.from(registeredFolders),
      filesystemFolders
    });
  } catch (error) {
    next(error);
  }
});

// 모든 테스트의 folder 컬럼을 id값 기준으로 일괄 업데이트하는 API
app.post('/api/admin/update-all-folder-names', authenticateAdmin, async (req, res, next) => {
  try {
    const tests = await Test.findAll();
    let updatedCount = 0;
    for (const test of tests) {
      const expectedFolder = `test${test.id}`;
      if (test.folder !== expectedFolder) {
        test.folder = expectedFolder;
        await test.save();
        updatedCount++;
      }
    }
    res.json({ success: true, message: `${updatedCount}개 테스트의 folder 컬럼이 업데이트되었습니다.`, updatedCount });
  } catch (error) {
    console.error('❌ folder 컬럼 업데이트 실패:', error);
    res.status(500).json({ error: 'folder 컬럼 업데이트 실패', detail: error.message });

    res.status(500).json({ success: false, error: error.message });
  }
});

// 외부 링크 테스트 등록 API
app.post('/api/admin/tests/add-external', authenticateAdmin, async (req, res, next) => {
  try {
    console.log('/api/admin/tests/add-external');
    const { externalUrl, title, description, category } = req.body;
    if (!externalUrl || !title) {
      return res.status(400).json({ error: '외부 링크와 제목은 필수입니다.' });
    }
    const test = await Test.create({
      title,
      description: description || '',
      category: category || '기타',
      externalUrl,
      folder: null,
      thumbnail: '/uploads/thumbnails/default-thumb.png',
    });
    res.json({ success: true, test });
  } catch (error) {
    next(error);
  }
});

app.get('/api/lotto/req', async (req, res) => {
  const drwNo = req.query.drwNo;
  const result = await fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}+1`);
  const data = await result.json();
  res.json(data);
});

// 로또 전체 리스트 조회
app.get('/api/lotto/list', async (req, res) => {
  try {
    const draws = await LottoDraw.findAll({ order: [['drawNo', 'DESC']] });
    res.json(draws);
  } catch (e) {
    res.status(500).json({ error: 'DB 조회 실패', detail: e.message });
  }
});

// 최신 회차 번호 조회
app.get('/api/lotto/latest', async (req, res) => {
  try {
    const latest = await LottoDraw.findOne({ order: [['drawNo', 'DESC']] });
    res.json({ latestNo: latest ? latest.drawNo : null });
  } catch (e) {
    res.status(500).json({ error: 'DB 조회 실패', detail: e.message });
  }
});

// 외부 API에서 최신 회차까지 DB에 저장 (최신 회차 갱신)
app.post('/api/lotto/update', async (req, res) => {
  try {
    // 1. DB에서 최신 회차 확인
    const latest = await LottoDraw.findOne({ order: [['drawNo', 'DESC']] });
    let startNo = latest ? latest.drawNo + 1 : 1;
    let n = startNo;
    let inserted = 0;
    let empty = !latest;
    // 최초에는 1회차부터 최신까지 모두 저장
    while (true) {
      const apiUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${n}`;
      const resApi = await fetch(apiUrl);
      const data = await resApi.json();
      if (data.returnValue !== 'success') break;
      // 이미 DB에 있으면 저장하지 않음
      const exists = await LottoDraw.findOne({ where: { drawNo: data.drwNo } });
      if (!exists) {
        await LottoDraw.create({
          drawNo: data.drwNo,
          numbers: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6].join(','),
          bonus: data.bnusNo,
          drawDate: data.drwNoDate
        });
        inserted++;
      }
      n++;
      // 최초에는 1회차부터 1000회 이상 반복 허용, 이후에는 100회 제한
      if ((empty && n > 2000) || (!empty && n > startNo + 100)) break;
    }
    res.json({ success: true, inserted });
  } catch (e) {
    res.status(500).json({ error: '로또 데이터 갱신 실패', detail: e.message });
  }
});

// 로또 번호 랭킹 API
app.get('/api/lotto-rank', async (req, res) => {
  try {
    const { count = 10 } = req.query;
    const limit = parseInt(count);
    
    // DB에서 로또 번호 데이터 조회
    const draws = await LottoDraw.findAll({
      order: [['drawNo', 'DESC']],
      limit: limit
    });
    
    // 번호별 출현 빈도 계산
    const numberCount = {};
    draws.forEach(draw => {
      const numbers = draw.numbers.split(',').map(n => parseInt(n));
      numbers.forEach(num => {
        numberCount[num] = (numberCount[num] || 0) + 1;
      });
    });
    
    // 1~45까지 모든 번호에 대해 빈도가 없는 번호는 0으로 설정
    const allNumbers = [];
    for (let i = 1; i <= 45; i++) {
      const cnt = numberCount[i] || 0;
      allNumbers.push({ num: i, cnt });
    }
    
    // 출현 빈도별로 정렬하여 top30 반환
    const top30 = allNumbers
      .sort((a, b) => b.cnt - a.cnt || a.num - b.num)
      .slice(0, 45);
    
    res.json({ top30 });
  } catch (e) {
    res.status(500).json({ error: '로또 랭킹 조회 실패', detail: e.message });
  }
});

// 자릿수 조합 랭킹 API
app.get('/api/lotto-digit-rank', async (req, res) => {
  try {
    const { count = 10 } = req.query;
    const limit = parseInt(count);
    
    // DB에서 로또 번호 데이터 조회
    const draws = await LottoDraw.findAll({
      order: [['drawNo', 'DESC']],
      limit: limit
    });
    
    // 자릿수 조합별 출현 빈도 계산
    const combinationCount = {};
    
    draws.forEach(draw => {
      const numbers = draw.numbers.split(',').map(n => parseInt(n));
      
      // 각 자릿수별 개수 계산
      const digitCounts = {
        '1': 0,   // 1~9
        '10': 0,  // 10~19
        '20': 0,  // 20~29
        '30': 0,  // 30~39
        '40': 0   // 40~45
      };
      
      numbers.forEach(num => {
        if (num >= 1 && num <= 9) {
          digitCounts['1']++;
        } else if (num >= 10 && num <= 19) {
          digitCounts['10']++;
        } else if (num >= 20 && num <= 29) {
          digitCounts['20']++;
        } else if (num >= 30 && num <= 39) {
          digitCounts['30']++;
        } else if (num >= 40 && num <= 45) {
          digitCounts['40']++;
        }
      });
      
      // 조합 문자열 생성 (예: "1-2-1-1-1")
      const combination = `${digitCounts['1']}-${digitCounts['10']}-${digitCounts['20']}-${digitCounts['30']}-${digitCounts['40']}`;
      
      // 조합별 출현 빈도 누적
      combinationCount[combination] = (combinationCount[combination] || 0) + 1;
    });
    
    // 조합별 랭킹 정렬
    const combinationRank = Object.entries(combinationCount)
      .map(([combination, count]) => ({ combination, count }))
      .sort((a, b) => b.count - a.count || a.combination.localeCompare(b.combination));
    
    res.json({ digitRank: combinationRank });
  } catch (e) {
    res.status(500).json({ error: '자릿수 조합 랭킹 조회 실패', detail: e.message });
  }
});


app.use('/api/sitemap', sitemapRouter);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 서버가 시작되었습니다. 포트: ${PORT}`);
});
export default app;