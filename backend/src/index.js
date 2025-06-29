import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import sequelize, { Test, Comment, Like, Visitor } from './models/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const execAsync = promisify(exec);

// multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({ storage: storage });

dotenv.config();

const app = express();

// CORS 설정을 더 구체적으로 설정
app.use(cors({
  origin: ['https://smartpick.website', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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
    arch: process.arch(),
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// 데이터베이스 상태 확인 라우트
app.get('/api/db-status', async (req, res) => {
  try {
    // 데이터베이스 연결 확인
    await sequelize.authenticate();
    
    // 테스트 테이블의 모든 데이터 조회
    const tests = await Test.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    // 시스템 정보 추가
    const os = require('os');
    
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
        platform: os.platform(),
        arch: os.arch(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length
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

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${req.method} ${req.path} - IP: ${getClientIP(req)}`;
  
  // 콘솔에 출력
  console.log('='.repeat(80));
  console.log(logMessage);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  
  // 라우트 매칭 확인을 위한 추가 로그
  if (req.path === '/api/admin/tests') {
    console.log('🔍 라우트 매칭 확인:', req.method, req.path);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Authorization:', req.headers.authorization ? '있음' : '없음');
  }
  
  // 파일에 로그 저장
  const fs = require('fs');
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, `server-${new Date().toISOString().split('T')[0]}.log`);
  const fullLogMessage = `${logMessage}\nHeaders: ${JSON.stringify(req.headers)}\nBody: ${JSON.stringify(req.body)}\n${'='.repeat(80)}\n`;
  
  fs.appendFileSync(logFile, fullLogMessage);
  
  console.log('='.repeat(80));
  next();
});

// 관리자 인증 미들웨어
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // 간단한 토큰 검증 (실제로는 JWT 사용 권장)
  if (token === process.env.ADMIN_TOKEN) {
    next();
  } else {
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
    const clientIP = getClientIP(req);
    
    const comments = await Comment.findAndCountAll({
      where: { testId: req.params.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // 각 댓글에 대해 좋아요 상태와 작성자 여부 추가
    const commentsWithStatus = await Promise.all(
      comments.rows.map(async (comment) => {
        const commentData = comment.toJSON();
        
        // 비밀번호 제거
        delete commentData.password;
        
        // 현재 사용자의 좋아요 상태 확인
        const userLike = await Like.findOne({
          where: { commentId: comment.id, ip: clientIP }
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
    
    const comment = await Comment.create({
      testId: req.params.id,
      nickname: nickname.trim(),
      content: content.trim(),
      password: password,
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
    
    // 댓글 존재 여부 확인
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }
    
    const existingLike = await Like.findOne({
      where: { commentId, ip: clientIP }
    });
    
    if (existingLike) {
      await existingLike.destroy();
      res.json({ liked: false });
    } else {
      await Like.create({ 
        commentId, 
        ip: clientIP,
        testId: comment.testId  // 댓글의 testId 사용
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

// 방문자 목록 조회
app.get('/api/visitors', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const visitors = await Visitor.findAndCountAll({
      order: [['visitedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      visitors: visitors.rows,
      total: visitors.count,
      pages: Math.ceil(visitors.count / limit),
      currentPage: parseInt(page)
    });
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

// 댓글 삭제
app.delete('/api/comments/:id', async (req, res, next) => {
  try {
    const { password } = req.body;
    const commentId = req.params.id;
    
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }
    
    // 기존 댓글(비밀번호가 없는 경우)은 IP 기반으로 확인
    if (!comment.password) {
      const clientIP = getClientIP(req);
      if (comment.ip !== clientIP) {
        return res.status(403).json({ error: '댓글을 삭제할 권한이 없습니다.' });
      }
    } else {
      // 새 댓글(비밀번호가 있는 경우)은 비밀번호로 확인
      if (!password) {
        return res.status(400).json({ error: '비밀번호를 입력해주세요.' });
      }
      
      if (comment.password !== password) {
        return res.status(403).json({ error: '비밀번호가 일치하지 않습니다.' });
      }
    }
    
    // 댓글과 관련된 좋아요도 함께 삭제
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
    const { username, password } = req.body;
    
    // 환경변수에서 관리자 정보 확인
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      res.json({ 
        token: process.env.ADMIN_TOKEN,
        message: '로그인 성공'
      });
    } else {
      res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }
  } catch (error) {
    next(error);
  }
});

// 테스트 등록 전용 deploy 스크립트 실행 함수
async function runTestDeployScript(clonePath) {
  const scriptPath = path.join(process.cwd(), '..', 'test_deploy.sh');
  try {
    const { stdout, stderr } = await execAsync(`bash ${scriptPath} ${clonePath}`);
    console.log('✅ test_deploy.sh 실행 결과:', stdout);
    if (stderr) console.error('test_deploy.sh stderr:', stderr);
    return { success: true, stdout, stderr };
  } catch (error) {
    console.error('❌ test_deploy.sh 실행 실패:', error.message);
    return { success: false, error: error.message };
  }
}

// 새 테스트 추가 (Git에서 클론) - POST 라우트를 먼저 정의
app.post('/api/admin/tests/add', authenticateAdmin, async (req, res, next) => {
  console.log('🎯 POST /api/admin/tests/add 핸들러 실행됨');
  
  const steps = {
    directoryCreated: false,
    gitCloned: false,
    packageJsonModified: false,
    npmInstalled: false,
    buildCompleted: false,
    databaseSaved: false,
    thumbnailReady: false
  };
  
  try {
    console.log('=== 테스트 추가 요청 시작 ===');
    console.log('요청 데이터:', JSON.stringify(req.body, null, 2));
    
    const { gitUrl, title, description, category } = req.body;
    if (!gitUrl || !title) {
      console.error('❌ 필수 입력값 누락');
      return res.status(400).json({ error: 'Git URL과 제목은 필수입니다.', steps });
    }

    // Git URL 유효성 검사
    if (!gitUrl.includes('github.com') && !gitUrl.includes('gitlab.com')) {
      console.error('❌ 지원하지 않는 Git 저장소:', gitUrl);
      return res.status(400).json({ error: 'GitHub 또는 GitLab 저장소만 지원합니다.', steps });
    }

    // 1. 테스트 디렉토리 생성
    const testsDir = path.join(process.cwd(), '..', 'frontend', 'public', 'tests');
    console.log('📁 테스트 디렉토리 경로:', testsDir);
    
    if (!fs.existsSync(testsDir)) {
      try {
        fs.mkdirSync(testsDir, { recursive: true });
        console.log('✅ 테스트 디렉토리 생성:', testsDir);
      } catch (error) {
        console.error('❌ 디렉토리 생성 실패:', error.message);
        return res.status(500).json({ error: '디렉토리 생성 실패', steps, detail: error.message });
      }
    }
    steps.directoryCreated = true;

    // 2. git clone
    const repoName = gitUrl.split('/').pop().replace('.git', '');
    const clonePath = path.join(testsDir, repoName);
    console.log('📂 클론 경로:', clonePath);
    
    if (fs.existsSync(clonePath)) {
      try {
        fs.rmSync(clonePath, { recursive: true, force: true });
        console.log('⚠️ 기존 디렉토리 삭제:', clonePath);
      } catch (error) {
        console.error('❌ 기존 디렉토리 삭제 실패:', error.message);
        return res.status(500).json({ error: '기존 디렉토리 삭제 실패', steps, detail: error.message });
      }
    }

    try {
      console.log('🔄 git clone 시작:', gitUrl);
      console.log('명령어:', `git clone ${gitUrl} ${clonePath}`);
      
      const { stdout, stderr } = await execAsync(`git clone ${gitUrl} ${clonePath}`, {
        timeout: 60000, // 60초 타임아웃
        maxBuffer: 1024 * 1024 // 1MB 버퍼
      });
      
      if (stderr) {
        console.warn('⚠️ git clone stderr:', stderr);
      }
      
      console.log('✅ git clone 성공:', stdout);
      steps.gitCloned = true;
    } catch (error) {
      console.error('❌ git clone 실패:', error.message);
      console.error('Error details:', error);
      return res.status(400).json({ 
        error: 'Git 저장소 클론 실패', 
        steps, 
        detail: error.message, 
        command: `git clone ${gitUrl} ${clonePath}`,
        stderr: error.stderr
      });
    }

    // 3. package.json 수정
    const packageJsonPath = path.join(clonePath, 'package.json');
    console.log('📄 package.json 경로:', packageJsonPath);
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        console.log('📦 원본 package.json:', JSON.stringify(packageJson, null, 2));
        
        packageJson.homepage = `/psycho/tests/${repoName}/`;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        
        console.log('✅ package.json 수정 완료');
        console.log('📦 수정된 package.json:', JSON.stringify(packageJson, null, 2));
        steps.packageJsonModified = true;
      } catch (error) {
        console.error('❌ package.json 수정 실패:', error.message);
        return res.status(500).json({ error: 'package.json 수정 실패', steps, detail: error.message });
      }
    } else {
      console.error('❌ package.json 없음:', packageJsonPath);
      return res.status(400).json({ error: 'package.json 없음', steps, path: packageJsonPath });
    }

    // 4. npm install & build (test_deploy.sh)
    console.log('🔨 test_deploy.sh 실행');
    const deployResult = await runTestDeployScript(clonePath);
    if (!deployResult.success) {
      console.error('❌ test_deploy.sh 실패:', deployResult.error);
      return res.status(400).json({ 
        error: '테스트 배포 스크립트 실패', 
        steps, 
        detail: deployResult.error, 
        stderr: deployResult.stderr 
      });
    }
    steps.npmInstalled = true;
    steps.buildCompleted = true;

    // 5. 썸네일 파일 확인
    const thumbPath = path.join(clonePath, 'thumb.png');
    console.log('🖼️ 썸네일 경로:', thumbPath);
    
    let thumbnailPath = `/uploads/thumbnails/${repoName}_${Date.now()}_thumb.png`;
    const destThumbPath = path.join(process.cwd(), '..', 'frontend', 'public', thumbnailPath);
    
    if (fs.existsSync(thumbPath)) {
      try {
        const uploadDir = path.dirname(destThumbPath);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
          console.log('✅ 업로드 디렉토리 생성:', uploadDir);
        }
        
        fs.copyFileSync(thumbPath, destThumbPath);
        steps.thumbnailReady = true;
        console.log('✅ 썸네일 복사 성공:', destThumbPath);
      } catch (error) {
        console.error('❌ 썸네일 복사 실패:', error.message);
        thumbnailPath = '/default-thumb.png';
        steps.thumbnailReady = false;
      }
    } else {
      thumbnailPath = '/default-thumb.png';
      steps.thumbnailReady = false;
      console.log('⚠️ thumb.png 없음, 기본 썸네일 사용');
    }

    // 6. DB 저장
    try {
      const test = await Test.create({
        title,
        description: description || '',
        category: category || '기타',
        thumbnail: thumbnailPath
      });
      steps.databaseSaved = true;
      console.log('✅ DB 저장 성공:', test.id);
      
      const response = {
        success: true,
        message: '테스트가 성공적으로 추가되었습니다.',
        test,
        steps,
        thumbnailUrl: thumbnailPath,
        clonePath: clonePath
      };
      
      console.log('🎉 최종 응답:', JSON.stringify(response, null, 2));
      return res.json(response);
    } catch (error) {
      console.error('❌ DB 저장 실패:', error.message);
      return res.status(500).json({ error: 'DB 저장 실패', steps, detail: error.message, stack: error.stack });
    }
  } catch (error) {
    console.error('❌ 테스트 추가 전체 오류:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ error: '서버 오류', steps, detail: error.message, stack: error.stack });
  }
});

// 테스트 목록 (관리자용) - GET 라우트를 나중에 정의
app.get('/api/admin/tests', authenticateAdmin, async (req, res, next) => {
  console.log('🎯 GET /api/admin/tests 핸들러 실행됨');
  
  try {
    console.log('=== 관리자 테스트 목록 요청 ===');
    console.log('요청 헤더:', JSON.stringify(req.headers, null, 2));
    
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

// 테스트 썸네일 업로드
app.post('/api/admin/tests/:id/thumbnail', authenticateAdmin, upload.single('thumbnail'), async (req, res, next) => {
  try {
    const testId = req.params.id;
    console.log('=== 썸네일 업로드 요청 ===');
    console.log('테스트 ID:', testId);
    console.log('업로드된 파일:', req.file);
    
    if (!req.file) {
      console.error('❌ 업로드된 파일이 없습니다.');
      return res.status(400).json({ error: '썸네일 파일이 필요합니다.' });
    }
    
    const test = await Test.findByPk(testId);
    if (!test) {
      console.error('❌ 테스트를 찾을 수 없습니다:', testId);
      return res.status(404).json({ error: '테스트를 찾을 수 없습니다.' });
    }
    
    console.log('✅ 테스트 찾음:', test.title);
    
    // 파일 확장자 검사
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      console.error('❌ 지원하지 않는 파일 형식:', fileExtension);
      return res.status(400).json({ 
        error: '지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP만 허용됩니다.' 
      });
    }
    
    // 파일 크기 검사 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      console.error('❌ 파일 크기가 너무 큽니다:', req.file.size);
      return res.status(400).json({ 
        error: '파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.' 
      });
    }
    
    // 파일 경로 설정
    const thumbnailPath = `/uploads/thumbnails/${testId}_${Date.now()}_${req.file.originalname}`;
    const fullPath = path.join(process.cwd(), '..', 'frontend', 'public', thumbnailPath);
    
    console.log('📁 썸네일 저장 경로:', fullPath);
    
    // 업로드 디렉토리 생성
    const uploadDir = path.dirname(fullPath);
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('✅ 업로드 디렉토리 생성:', uploadDir);
      } catch (error) {
        console.error('❌ 업로드 디렉토리 생성 실패:', error.message);
        return res.status(500).json({ error: '업로드 디렉토리 생성 실패', detail: error.message });
      }
    }
    
    // 파일 이동
    try {
      fs.renameSync(req.file.path, fullPath);
      console.log('✅ 파일 이동 완료:', req.file.path, '->', fullPath);
    } catch (error) {
      console.error('❌ 파일 이동 실패:', error.message);
      return res.status(500).json({ error: '파일 이동 실패', detail: error.message });
    }
    
    // 파일 권한 설정
    try {
      fs.chmodSync(fullPath, 0o644);
      console.log('✅ 파일 권한 설정 완료');
    } catch (error) {
      console.warn('⚠️ 파일 권한 설정 실패:', error.message);
    }
    
    // 기존 썸네일 파일 삭제 (기본 썸네일이 아닌 경우)
    if (test.thumbnail && test.thumbnail !== '/default-thumb.png') {
      try {
        const oldThumbPath = path.join(process.cwd(), '..', 'frontend', 'public', test.thumbnail);
        if (fs.existsSync(oldThumbPath)) {
          fs.unlinkSync(oldThumbPath);
          console.log('✅ 기존 썸네일 삭제:', oldThumbPath);
        }
      } catch (error) {
        console.warn('⚠️ 기존 썸네일 삭제 실패:', error.message);
      }
    }
    
    // 데이터베이스 업데이트
    test.thumbnail = thumbnailPath;
    await test.save();
    
    console.log('✅ 데이터베이스 업데이트 완료');
    
    res.json({ 
      success: true, 
      message: '썸네일이 업데이트되었습니다.', 
      thumbnail: thumbnailPath,
      fileSize: req.file.size,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('❌ 썸네일 업로드 오류:', error.message);
    console.error('Error stack:', error.stack);
    next(error);
  }
});

// 방문자 통계 (상세)
app.get('/api/admin/analytics', authenticateAdmin, async (req, res, next) => {
  try {
    const { period = 'day', limit = 30 } = req.query;
    
    let startDate = new Date();
    let groupBy = 'DATE(visitedAt)';
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        groupBy = 'YEARWEEK(visitedAt)';
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        groupBy = 'DATE_FORMAT(visitedAt, "%Y-%m")';
        break;
      default:
        startDate.setDate(startDate.getDate() - limit);
        break;
    }
    
    const visitors = await sequelize.query(`
      SELECT 
        ${groupBy} as date,
        COUNT(*) as count
      FROM Visitors 
      WHERE visitedAt >= ?
      GROUP BY ${groupBy}
      ORDER BY date DESC
      LIMIT ?
    `, {
      replacements: [startDate, parseInt(limit)],
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json(visitors);
  } catch (error) {
    next(error);
  }
});

// 방문자 상세 로그
app.get('/api/admin/visitors', authenticateAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const visitors = await Visitor.findAndCountAll({
      include: [{
        model: Test,
        attributes: ['title']
      }],
      order: [['visitedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      visitors: visitors.rows,
      total: visitors.count,
      pages: Math.ceil(visitors.count / limit),
      currentPage: parseInt(page)
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
    await Visitor.destroy({ where: { testId } });
    
    // 테스트 삭제
    await test.destroy();
    
    console.log('테스트 삭제 완료:', testId);
    res.json({ success: true, message: '테스트가 삭제되었습니다.' });
  } catch (error) {
    console.error('테스트 삭제 오류:', error);
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