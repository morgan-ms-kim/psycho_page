const fs = require('fs');
const path = require('path');

// 템플릿 폴더들 찾기
const templatesDir = './frontend/tests';
const templateFolders = fs.readdirSync(templatesDir)
  .filter(folder => folder.startsWith('template'))
  .sort();

console.log('수정할 템플릿 폴더들:', templateFolders);

templateFolders.forEach(folder => {
  const appPath = path.join(templatesDir, folder, 'src', 'App.jsx');
  
  if (fs.existsSync(appPath)) {
    console.log(`수정 중: ${appPath}`);
    
    let content = fs.readFileSync(appPath, 'utf8');
    
    // export default function App() -> function App()
    content = content.replace(/export default function App\(\)/g, 'function App()');
    
    // 마지막 } 뒤에 전역 노출 코드 추가
    if (!content.includes('window.TemplateComponent')) {
      content = content.replace(/(\s*);\s*$/, `
  );
}

// 전역 객체에 컴포넌트 노출
window.TemplateComponent = App;

export default App;`);
    }
    
    fs.writeFileSync(appPath, content);
    console.log(`✅ 완료: ${folder}`);
  } else {
    console.log(`❌ 파일 없음: ${appPath}`);
  }
});

console.log('\n모든 템플릿 수정 완료!'); 