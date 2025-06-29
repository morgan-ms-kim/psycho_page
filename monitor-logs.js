const fs = require('fs');
const path = require('path');

// 로그 디렉토리 경로
const logDir = path.join(__dirname, 'backend', 'logs');

console.log('🔍 실시간 로그 모니터링');
console.log('로그 디렉토리:', logDir);
console.log('Ctrl+C를 눌러 종료하세요.\n');

// 로그 디렉토리 생성
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log('✅ 로그 디렉토리 생성됨');
}

// 오늘 날짜의 로그 파일
const today = new Date().toISOString().split('T')[0];
const logFile = path.join(logDir, `server-${today}.log`);

console.log('📅 모니터링 중인 파일:', logFile);
console.log('='.repeat(80));

let lastSize = 0;

// 파일 변경 감지
function checkLogFile() {
  if (fs.existsSync(logFile)) {
    const stats = fs.statSync(logFile);
    const currentSize = stats.size;
    
    if (currentSize > lastSize) {
      // 새로운 로그 읽기
      const stream = fs.createReadStream(logFile, {
        start: lastSize,
        end: currentSize
      });
      
      stream.on('data', (chunk) => {
        process.stdout.write(chunk.toString());
      });
      
      lastSize = currentSize;
    }
  }
  
  // 1초마다 체크
  setTimeout(checkLogFile, 1000);
}

// 초기 파일 크기 설정
if (fs.existsSync(logFile)) {
  const stats = fs.statSync(logFile);
  lastSize = stats.size;
  console.log('📄 기존 로그 크기:', lastSize, 'bytes');
}

// 모니터링 시작
checkLogFile(); 