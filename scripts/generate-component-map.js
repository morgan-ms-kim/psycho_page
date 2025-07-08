const fs = require('fs');
const path = require('path');

const TESTS_DIR = path.join(__dirname, '..', 'frontend', 'tests');
const OUTPUT_FILE = path.join(__dirname, '..', 'frontend', 'pages', 'testview', 'componentMap.js');

const exts = ['App.jsx', 'App.js', 'App.tsx'];
const map = {};

fs.readdirSync(TESTS_DIR).forEach(folder => {
  const srcDir = path.join(TESTS_DIR, folder, 'src');
  if (!fs.existsSync(srcDir)) return;
  for (const ext of exts) {
    const appPath = path.join(srcDir, ext);
    if (fs.existsSync(appPath)) {
      // frontend/pages/testview/componentMap.js에서 import할 수 있게 상대경로 지정
      const relPath = `../tests/${folder}/src/${ext}`;
      map[folder] = relPath;
      break;
    }
  }
});

const fileContent =
  '// 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.\n' +
  'const componentMap = {\n' +
  Object.entries(map)
    .map(
      ([key, relPath]) =>
        `  "${key}": () => require("${relPath}").default,`
    )
    .join('\n') +
  '\n};\n\nexport default componentMap;\n';

fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
console.log('componentMap.js 생성 완료:', OUTPUT_FILE); 