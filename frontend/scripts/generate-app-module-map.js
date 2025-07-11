const fs = require('fs');
const path = require('path');

// 설정
const TESTS_DIR = 'tests';
const OUTPUT_FILE = 'appModuleMap.js';

console.log('🔍 tests/ 디렉토리 스캔 중...');

// tests 디렉토리 존재 확인
if (!fs.existsSync(TESTS_DIR)) {
  console.log('❌ tests 디렉토리가 존재하지 않습니다:', TESTS_DIR);
  process.exit(1);
}

// 템플릿 폴더들 찾기
const templateFolders = fs.readdirSync(TESTS_DIR)
  .filter(folder => folder.startsWith('template'))
  .sort();

console.log('📁 발견된 템플릿 폴더들:', templateFolders);

// 각 템플릿 폴더에서 App 파일 찾기
const importLines = [];

templateFolders.forEach(folder => {
  const possiblePaths = [
    path.join(TESTS_DIR, folder, 'src', 'App.js'),
    path.join(TESTS_DIR, folder, 'src', 'App.jsx'),
    path.join(TESTS_DIR, folder, 'src', 'App.tsx')
  ];

  let foundPath = null;
  let foundExtension = null;

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      foundPath = filePath;
      foundExtension = path.extname(filePath);
      break;
    }
  }

  if (foundPath) {
    console.log(`✅ ${folder}: ${path.basename(foundPath)}`);
    importLines.push(`  "${folder}": () => import('./tests/${folder}/src/App${foundExtension}'),`);
  } else {
    console.log(`❌ ${folder}: App 파일을 찾을 수 없음`);
  }
});

// appModuleMap.js 파일 생성
const moduleMapContent = `// 자동 생성된 앱 모듈 맵
// 이 파일은 scripts/generate-app-module-map.js에 의해 자동 생성됩니다.

export const appModuleMap = {
${importLines.join('\n')}
};

export default appModuleMap;

// 사용 예시:
// import { appModuleMap } from './appModuleMap';
// const importFunc = appModuleMap['template74'];
// const module = await importFunc();
`;

// 파일 작성
fs.writeFileSync(OUTPUT_FILE, moduleMapContent, 'utf8');

console.log(`\n📝 ${OUTPUT_FILE} 파일이 생성되었습니다.`);
console.log(`📊 총 ${templateFolders.length}개 템플릿 폴더 처리 완료`);
console.log(`✅ ${importLines.length}개 App 파일 발견`);

// package.json에 빌드 전 스크립트 추가 안내
console.log('\n💡 package.json에 다음 스크립트를 추가하세요:');
console.log('"prebuild": "node scripts/generate-app-module-map.js"'); 