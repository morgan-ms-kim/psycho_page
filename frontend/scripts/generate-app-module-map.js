const fs = require('fs');
const path = require('path');

// 설정 - 스크립트가 frontend 디렉토리에서 실행된다고 가정
const TESTS_DIR = path.resolve(__dirname, '../tests');
const OUTPUT_FILE = path.resolve(__dirname, '../appModuleMap.js');

console.log('🔍 tests/ 디렉토리 스캔 중...');
console.log('현재 작업 디렉토리:', process.cwd());
console.log('테스트 디렉토리 경로:', TESTS_DIR);

// tests 디렉토리 존재 확인
if (!fs.existsSync(TESTS_DIR)) {
  console.error('❌ tests 디렉토리가 존재하지 않습니다:', TESTS_DIR);
  process.exit(1);
}

// 템플릿 폴더들 찾기
const templateFolders = fs.readdirSync(TESTS_DIR)
  .filter(folder => folder.startsWith('template'))
  .sort();

console.log('📁 발견된 템플릿 폴더들:', templateFolders);

const entries = [];

templateFolders.forEach(folder => {
  const possiblePaths = [
    path.join(TESTS_DIR, folder, 'src', 'App.js'),
    path.join(TESTS_DIR, folder, 'src', 'App.jsx'),
    path.join(TESTS_DIR, folder, 'src', 'App.tsx')
  ];

  let foundPath = null;

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      foundPath = filePath;
      break;
    }
  }

  if (foundPath) {
    const relativeImportPath = foundPath.replace(/\\/g, '/').replace(path.resolve(__dirname, '..').replace(/\\/g, '/') + '/', '/');
    // 예: /tests/template74/src/App.jsx
    console.log(`✅ ${folder}: App 파일 발견 - ${relativeImportPath}`);
    entries.push(`  "${folder}": () => import('${relativeImportPath}')`);
  } else {
    console.warn(`❌ ${folder}: App 파일을 찾을 수 없음`);
  }
});

// appModuleMap.js 파일 내용 생성
const moduleMapContent = `
// 자동 생성된 앱 모듈 맵
// 이 파일은 scripts/generate-app-module-map.js에 의해 자동 생성됩니다.

const appModuleMap = {
${entries.join(',\n')}
};

export default appModuleMap;

// 사용 예시:
// import appModuleMap from './appModuleMap';
// const moduleLoader = appModuleMap['template74'];
// const module = await moduleLoader();
`;

fs.writeFileSync(OUTPUT_FILE, moduleMapContent.trim(), 'utf8');

console.log(`\n📝 ${OUTPUT_FILE} 파일이 생성되었습니다.`);
console.log(`📊 총 ${templateFolders.length}개 템플릿 폴더 중 ${entries.length}개 App 파일 발견`);
