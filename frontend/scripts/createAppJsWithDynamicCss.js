const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.resolve(__dirname, '../pages');
const APP_JS_PATH = path.join(PAGES_DIR, '_app.js');

const APP_JS_CONTENT = `
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const match = router.pathname.match(/^\\/testview\\/(template\\d+)/);
    if (match) {
      const id = match[1];
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/tests/' + id + '/src/globals.css';
      document.head.appendChild(link);
    }
  }, [router.pathname]);

  return <Component {...pageProps} />;
}

export default MyApp;
`.trim();

function createAppJsIfMissing() {
  if (!fs.existsSync(PAGES_DIR)) {
    console.error('❌ pages/ 디렉토리가 존재하지 않습니다.');
    return;
  }

  if (fs.existsSync(APP_JS_PATH)) {
    console.log('✅ pages/_app.js 파일이 이미 존재합니다. 건드리지 않았습니다.');
    return;
  }

  fs.writeFileSync(APP_JS_PATH, APP_JS_CONTENT, 'utf-8');
  console.log('✅ pages/_app.js 생성 완료! 동적 글로벌 스타일 주입 코드가 포함되었습니다.');
}

createAppJsIfMissing();
