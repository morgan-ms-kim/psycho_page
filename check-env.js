const fs = require('fs');
const path = require('path');

console.log('🔍 환경 변수 확인 도구');
console.log('======================');

// .env 파일 경로들
const envPaths = [
  path.join(__dirname, 'backend', '.env'),
  path.join(__dirname, '.env'),
  '/var/www/html/wordpress/psycho_page/backend/.env'
];

console.log('📁 .env 파일 검색 중...');

let envFile = null;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    envFile = envPath;
    console.log('✅ .env 파일 발견:', envPath);
    break;
  }
}

if (!envFile) {
  console.log('❌ .env 파일을 찾을 수 없습니다.');
  console.log('검색한 경로들:');
  envPaths.forEach(p => console.log('  -', p));
  process.exit(1);
}

// .env 파일 내용 읽기
try {
  const envContent = fs.readFileSync(envFile, 'utf8');
  console.log('\n📄 .env 파일 내용:');
  console.log('======================');
  
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        // 비밀번호는 마스킹
        if (key.toLowerCase().includes('password')) {
          console.log(`${key}=${'*'.repeat(Math.min(value.length, 8))}`);
        } else {
          console.log(`${key}=${value}`);
        }
      }
    }
  });
  
  // 필수 환경 변수 확인
  console.log('\n🔍 필수 환경 변수 확인:');
  console.log('======================');
  
  const requiredVars = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_TOKEN'];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    const line = lines.find(l => l.startsWith(varName + '='));
    if (line) {
      console.log(`✅ ${varName}: 설정됨`);
    } else {
      console.log(`❌ ${varName}: 설정되지 않음`);
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('\n⚠️ 누락된 환경 변수들:');
    missingVars.forEach(varName => console.log(`  - ${varName}`));
  } else {
    console.log('\n✅ 모든 필수 환경 변수가 설정되어 있습니다.');
  }
  
} catch (error) {
  console.error('❌ .env 파일 읽기 실패:', error.message);
} 