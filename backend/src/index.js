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
    const uploadDir = path.join(process.cwd(), '..', 'frontend', 'public', 'uploads', 'thumbnails');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 파일명: testID_타임스탬프_원본이름
    const testId = req.params.id || 'temp';
    cb(null, `${testId}_${Date.now()}_${file.originalname}`);
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
  origin: ['https://smartpick.website', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 정적 파일 서빙 (업로드된 썸네일)
app.use('/psycho_page/uploads', express.static(path.join(process.cwd(), '..', 'frontend', 'public', 'uploads')));
// 빌드된 테스트 앱 정적 서빙
app.use('/psycho_page/tests', express.static(path.join(process.cwd(), '..', 'frontend', 'public', 'tests')));

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
        if (testData.thumbnail.startsWith('/uploads/')) {
          testData.thumbnail = testData.thumbnail.replace('/uploads/', '/psycho_page/uploads/');
        } else if (!testData.thumbnail.startsWith('/psycho_page/')) {
          testData.thumbnail = `/psycho_page${testData.thumbnail}`;
        }
      }
      return testData;
    });
    
    res.json(testsWithCorrectPaths);
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
      if (testData.thumbnail.startsWith('/uploads/')) {
        testData.thumbnail = testData.thumbnail.replace('/uploads/', '/psycho_page/uploads/');
      } else if (!testData.thumbnail.startsWith('/psycho_page/')) {
        testData.thumbnail = `/psycho_page${testData.thumbnail}`;
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
      await existingLike.destroy();
      await Test.decrement('likes', { where: { id: testId } });
      res.json({ liked: false, message: '좋아요가 취소되었습니다.' });
    } else {
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
    
    const commentsWithStatus = await Promise.all(
      comments.rows.map(async (comment) => {
        const commentData = comment.toJSON();
        delete commentData.password;
        
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

// 방문자 통계
app.get('/api/visitors/count', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const total = await Visitor.count();
    const todayCount = await Visitor.count({ 
      where: { visitedAt: { [Op.gte]: today } } 
    });
    
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
    
    if (!comment.password) {
      const clientIP = getClientIP(req);
      if (comment.ip !== clientIP) {
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

// 새 테스트 추가 (Git에서 클론)
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
        console.log('🗑️ 기존 디렉토리 삭제:', clonePath);
      } catch (error) {
        console.error('❌ 기존 디렉토리 삭제 실패:', error.message);
        return res.status(500).json({ error: '기존 디렉토리 삭제 실패', steps, detail: error.message });
      }
    }
    
    try {
      console.log('🔗 Git 클론 시작:', gitUrl);
      await execAsync(`git clone ${gitUrl} "${clonePath}"`, { timeout: 300000 });
      console.log('✅ Git 클론 완료');
      steps.gitCloned = true;
    } catch (error) {
      console.error('❌ Git 클론 실패:', error.message);
      return res.status(400).json({ error: 'Git 클론 실패', steps, detail: error.message, stderr: error.stderr });
    }

    // 3. package.json 수정 (homepage 필드 추가)
    const packageJsonPath = path.join(clonePath, 'package.json');
    console.log('📄 package.json 경로:', packageJsonPath);
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        console.log('📦 원본 package.json:', JSON.stringify(packageJson, null, 2));
        
        // homepage 필드 확인
        if (!packageJson.homepage) {
          console.log('➕ homepage 필드가 없습니다. 새로 추가합니다.');
          packageJson.homepage = `/psycho/tests/${repoName}/`;
        } else {
          console.log('🔄 homepage 필드가 있습니다. 업데이트합니다.');
          console.log('📝 기존 homepage:', packageJson.homepage);
          packageJson.homepage = `/psycho/tests/${repoName}/`;
        }
        
        console.log('📝 새로운 homepage:', packageJson.homepage);
        
        // JSON 형식 유지하면서 저장
        const updatedPackageJson = JSON.stringify(packageJson, null, 2);
        fs.writeFileSync(packageJsonPath, updatedPackageJson);
        
        console.log('✅ package.json 수정 완료');
        console.log('📦 수정된 package.json:', updatedPackageJson);
        steps.packageJsonModified = true;
      } catch (error) {
        console.error('❌ package.json 수정 실패:', error.message);
        console.error('❌ package.json 내용:', fs.readFileSync(packageJsonPath, 'utf8'));
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
    
    let thumbnailPath = `/psycho_page/uploads/thumbnails/${repoName}_${Date.now()}_thumb.png`;
    const destThumbPath = path.join(process.cwd(), '..', 'frontend', 'public', 'uploads', 'thumbnails', `${repoName}_${Date.now()}_thumb.png`);
    
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
        thumbnailPath = '/psycho_page/default-thumb.png';
        steps.thumbnailReady = false;
      }
    } else {
      thumbnailPath = '/psycho_page/default-thumb.png';
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
      
      // 7. 폴더명을 test{id} 형식으로 변경
      const newFolderName = `test${test.id}`;
      const newClonePath = path.join(testsDir, newFolderName);
      
      try {
        if (fs.existsSync(newClonePath)) {
          fs.rmSync(newClonePath, { recursive: true, force: true });
          console.log('🗑️ 기존 test{id} 폴더 삭제:', newClonePath);
        }
        
        fs.renameSync(clonePath, newClonePath);
        console.log('📁 폴더명 변경 완료:', `${repoName} → ${newFolderName}`);
        
        // package.json의 homepage도 업데이트
        const newPackageJsonPath = path.join(newClonePath, 'package.json');
        if (fs.existsSync(newPackageJsonPath)) {
          try {
            const packageJson = JSON.parse(fs.readFileSync(newPackageJsonPath, 'utf8'));
            
            // homepage 필드가 없으면 추가, 있으면 업데이트
            if (!packageJson.homepage) {
              console.log('➕ homepage 필드 추가:', `/psycho_page/tests/${newFolderName}/`);
              packageJson.homepage = `/psycho_page/tests/${newFolderName}/`;
            } else {
              console.log('🔄 homepage 필드 업데이트:', `/psycho_page/tests/${newFolderName}/`);
              packageJson.homepage = `/psycho_page/tests/${newFolderName}/`;
            }
            
            const updatedPackageJson = JSON.stringify(packageJson, null, 2);
            fs.writeFileSync(newPackageJsonPath, updatedPackageJson);
            console.log('📦 package.json homepage 업데이트 완료');
            console.log('📦 최종 package.json:', updatedPackageJson);
          } catch (error) {
            console.error('❌ package.json 업데이트 실패:', error.message);
          }
        }
        
      } catch (error) {
        console.error('❌ 폴더명 변경 실패:', error.message);
      }
      
      const response = {
        success: true,
        message: '테스트가 성공적으로 추가되었습니다.',
        test,
        steps,
        thumbnailUrl: thumbnailPath,
        clonePath: newClonePath,
        folderName: newFolderName
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
    if (testData.thumbnail) {
      if (testData.thumbnail.startsWith('/uploads/')) {
        testData.thumbnail = testData.thumbnail.replace('/uploads/', '/psycho_page/uploads/');
      } else if (!testData.thumbnail.startsWith('/psycho_page/')) {
        testData.thumbnail = `/psycho_page${testData.thumbnail}`;
      }
    }
    
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
    const thumbnailPath = `/psycho_page/uploads/thumbnails/${req.file.filename}`;
    
    console.log('📂 썸네일 경로:', thumbnailPath);
    
    // 기존 썸네일 삭제 (기본 썸네일 제외)
    if (test.thumbnail && test.thumbnail !== '/psycho_page/default-thumb.png') {
      try {
        const oldThumbPath = path.join(process.cwd(), '..', 'frontend', 'public', test.thumbnail.replace('/psycho_page/', ''));
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

// 에러 핸들링 미들웨어
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: '서버 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

app.use(errorHandler);

// 서버 시작 및 DB 동기화
const PORT = process.env.PORT || 4000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}); 