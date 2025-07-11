const fs = require('fs');
const path = require('path');

const TESTS_DIR = path.resolve(__dirname, '../tests');

// 전역 스타일 판별
function isGlobalSelector(line) {
  return (
    line.startsWith(':root') ||
    line.startsWith('body') ||
    line.startsWith('html') ||
    line.startsWith('@import') ||
    line.startsWith('@keyframes') ||
    line.startsWith('@font-face') ||
    line.startsWith('@media')
  );
}

function processTemplateFolder(folderPath) {
  const srcDir = path.join(folderPath, 'src');
  if (!fs.existsSync(srcDir)) return;

  console.error(`${srcDir} `);
  const appCssPath = path.join(srcDir, 'App.css');
  const appModuleCssPath = path.join(srcDir, 'App.module.css');
  const globalCssPath = path.join(srcDir, 'globals.css');

  const appFileName = ['App.js', 'App.jsx', 'App.tsx'].find(f =>
    fs.existsSync(path.join(srcDir, f))
  );
  if (!fs.existsSync(appCssPath) || !appFileName) return;

  const appFilePath = path.join(srcDir, appFileName);
  const cssLines = fs.readFileSync(appCssPath, 'utf-8').split('\n');

  const globalLines = [];
  const moduleLines = [];

  let isInGlobalBlock = false;
  let braceDepth = 0;

  for (const line of cssLines) {
    const trimmed = line.trim();

    if (!isInGlobalBlock && isGlobalSelector(trimmed)) {
      isInGlobalBlock = true;
      braceDepth = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      globalLines.push(line);
    } else if (isInGlobalBlock) {
      globalLines.push(line);
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;
      if (braceDepth <= 0) {
        isInGlobalBlock = false;
      }
    } else {
      moduleLines.push(line);
    }
  }

  // 파일 쓰기
  fs.writeFileSync(appModuleCssPath, moduleLines.join('\n'), 'utf-8');
  fs.writeFileSync(globalCssPath, globalLines.join('\n'), 'utf-8');
  fs.unlinkSync(appCssPath);

  // App.js 수정: App.css → App.module.css, 그리고 globals.css 추가
  let jsCode = fs.readFileSync(appFilePath, 'utf-8');

  // 기존 App.css 제거
  jsCode = jsCode.replace(/import\s+['"].\/App\.css['"]\s*;?/g, '');

  // globals.css와 App.module.css 추가 (중복 방지)
  if (!jsCode.includes(`./globals.css`)) {
    jsCode = `import './globals.css';\n` + jsCode;
  }
  if (!jsCode.includes(`./App.module.css`)) {
    jsCode = `import './App.module.css';\n` + jsCode;
  }

  fs.writeFileSync(appFilePath, jsCode, 'utf-8');
  console.log(`✅ ${path.basename(folderPath)} - CSS 분리 및 import 처리 완료`);
}

function processAllTemplates() {
  if (!fs.existsSync(TESTS_DIR)) {
    console.error(`❌ ${TESTS_DIR} 폴더가 없습니다.`);
    return;
  }

  const folders = fs.readdirSync(TESTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(TESTS_DIR, dirent.name));

  folders.forEach(processTemplateFolder);
}

processAllTemplates();
