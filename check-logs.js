const fs = require('fs');
const path = require('path');

// 로그 디렉토리 경로
const logDir = path.join(__dirname, 'backend', 'logs');

console.log('🔍 로그 확인 도구');
console.log('로그 디렉토리:', logDir);

// 로그 디렉토리 존재 확인
if (!fs.existsSync(logDir)) {
  console.log('❌ 로그 디렉토리가 존재하지 않습니다.');
  console.log('백엔드 서버를 실행하면 로그가 생성됩니다.');
  process.exit(1);
}

// 오늘 날짜의 로그 파일
const today = new Date().toISOString().split('T')[0];
const logFile = path.join(logDir, `server-${today}.log`);

console.log('📅 오늘 날짜:', today);
console.log('📄 로그 파일:', logFile);

if (fs.existsSync(logFile)) {
  console.log('\n📋 최근 로그 (마지막 50줄):');
  console.log('='.repeat(80));
  
  const content = fs.readFileSync(logFile, 'utf8');
  const lines = content.split('\n');
  const recentLines = lines.slice(-50);
  
  recentLines.forEach(line => {
    if (line.trim()) {
      console.log(line);
    }
  });
} else {
  console.log('❌ 오늘의 로그 파일이 없습니다.');
  
  // 다른 로그 파일들 확인
  const files = fs.readdirSync(logDir);
  if (files.length > 0) {
    console.log('\n📁 사용 가능한 로그 파일들:');
    files.forEach(file => {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      console.log(`- ${file} (${stats.size} bytes, ${stats.mtime})`);
    });
  } else {
    console.log('❌ 로그 파일이 없습니다.');
  }
}

console.log('\n💡 로그 확인 방법:');
console.log('1. 백엔드 서버가 실행 중인지 확인');
console.log('2. 관리자 페이지에서 테스트 등록 시도');
console.log('3. 이 스크립트를 다시 실행하여 로그 확인'); 