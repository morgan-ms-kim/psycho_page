#!/bin/bash

LOGFILE="deploy.log"
exec > >(tee -a "$LOGFILE") 2>&1

# 인자로 받은 폴더명 사용
FOLDER_NAME="$1"

if [ -z "$FOLDER_NAME" ]; then
  echo "[ERROR] 폴더명 인자가 필요합니다."
  exit 1
fi

# 작업 디렉토리 이동
if [ ! -d "$FOLDER_NAME" ]; then
  echo "[ERROR] 디렉토리가 존재하지 않습니다: $FOLDER_NAME"
  exit 1
fi

cd "$FOLDER_NAME" || {
  echo "[ERROR] 디렉토리로 이동할 수 없습니다: $FOLDER_NAME"
  exit 1
}

echo "[INFO] 현재 작업 디렉토리: $(pwd)"
echo "[INFO] 디렉토리 내용:"
ls -la

# package.json 존재 확인
if [ ! -f "package.json" ]; then
  echo "[ERROR] package.json 파일이 없습니다."
  exit 1
fi

echo "[INFO] package.json 내용:"
cat package.json

# package.json의 homepage 필드 확인 및 수정
echo "[INFO] package.json의 homepage 필드 확인 중..."
if ! grep -q '"homepage"' package.json; then
  echo "[INFO] homepage 필드가 없습니다. 추가합니다..."
  cp package.json package.json.tmp
  sed -i 's/}$/  "homepage": "\/tests\/'"$FOLDER_NAME"'\/",\n}/' package.json.tmp
  echo "[INFO] 수정된 package.json:"
  cat package.json.tmp
  mv package.json.tmp package.json
  echo "[INFO] homepage 필드 추가 완료"
else
  echo "[INFO] homepage 필드가 이미 존재합니다."
  grep '"homepage"' package.json
fi

TEST_PATH="/tests/$FOLDER_NAME/"
SERVICE_PATH="/tests/$FOLDER_NAME"
# vite.config.js 파일 확인 및 base 설정 추가
echo "[INFO] vite.config.js 파일 확인 중..."
if [ -f "vite.config.js" ]; then
  echo "[INFO] vite.config.js 파일이 발견되었습니다."
  echo "[INFO] 현재 vite.config.js 내용:"
  cat vite.config.js
  if ! grep -q "base:" vite.config.js; then
    echo "[INFO] base 설정이 없습니다. 추가합니다..."
    cp vite.config.js vite.config.js.tmp
    sed -i "s#defineConfig({#defineConfig({\n  base: '$TEST_PATH',#" vite.config.js.tmp
    echo "[INFO] 수정된 vite.config.js:"
    cat vite.config.js.tmp
    mv vite.config.js.tmp vite.config.js
    echo "[INFO] vite.config.js base 설정 추가 완료"
  else
    echo "[INFO] base 설정이 이미 존재합니다."
    grep "base:" vite.config.js
  fi
else
  echo "[INFO] vite.config.js 파일이 없습니다."
fi

# src/App.jsx 또는 src/App.js의 <Router> 또는 <BrowserRouter>를 <BrowserRouter basename="SERVICE_PATH">로 자동 치환
APP_FILE=""
if [ -f "src/App.jsx" ]; then
  APP_FILE="src/App.jsx"
elif [ -f "src/App.js" ]; then
  APP_FILE="src/App.js"
fi

if [ -n "$APP_FILE" ]; then
  echo "[INFO] SERVICE_PATH: $SERVICE_PATH"
  echo "[INFO] $APP_FILE 파일에서 Router/Basename 자동 치환"
  # <Router> → <Router basename=...>
  sed -i "s|<Router>|<Router basename=\"$SERVICE_PATH\">|g" "$APP_FILE"
  # </Router> → </Router>
  # (닫는 태그는 그대로)
  # <BrowserRouter> → <BrowserRouter basename=...>
  sed -i "s|<BrowserRouter>|<BrowserRouter basename=\"$SERVICE_PATH\">|g" "$APP_FILE"
  # </BrowserRouter> → </BrowserRouter>
  # (닫는 태그는 그대로)
  # BrowserRouter import가 없으면 자동 추가 (alias 포함)
  if ! grep -q "import { BrowserRouter" "$APP_FILE"; then
    sed -i '1iimport { BrowserRouter } from "react-router-dom";' "$APP_FILE"
    echo "[INFO] BrowserRouter import 구문 자동 추가"
  fi
  # BrowserRouter as Router alias import가 있는 경우도 지원
  if grep -q "import { BrowserRouter as Router" "$APP_FILE"; then
    # JSX에서 <Router> ... </Router>를 <Router ...> ... </Router>로 변환 (이미 위에서 처리)
    echo "[INFO] BrowserRouter as Router alias import 및 JSX 치환 처리 완료"
  fi
  echo "[INFO] 수정된 $APP_FILE Router 부분:"
  grep "Router" "$APP_FILE"
else
  echo "[WARNING] src/App.jsx 또는 src/App.js 파일이 없습니다."
fi

echo "[INFO] 빌드 전 vite.config.js:"
cat vite.config.js
echo "[INFO] 빌드 전 src/App.jsx Router 부분:"

grep "Router" src/App.jsx
grep "Router" src/App.js

grep "BrowserRouter" src/App.jsx
grep "BrowserRouter" src/App.js

echo "[INFO] Node.js 버전:"
node --version
echo "[INFO] npm 버전:"
npm --version

echo "[INFO] npm install 시작"
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
  echo "[ERROR] npm install 실패"
  exit 2
fi

echo "[INFO] npm install 완료"
echo "[INFO] node_modules 확인:"
ls -la node_modules | head -10

echo "[INFO] npm run build 시작"
npm run build
if [ $? -ne 0 ]; then
  echo "[ERROR] npm run build 실패"
  exit 3
fi

echo "[INFO] npm run build 완료"
echo "[INFO] build 결과 확인:"
ls -la build/ 2>/dev/null || ls -la dist/ 2>/dev/null || echo "build/dist 디렉토리를 찾을 수 없습니다"

echo "[INFO] build 결과물을 상위로 복사"
if [ -d "build" ]; then
  echo "[INFO] build 폴더 내용을 상위로 복사"
  cp -r build/* .
  echo "[INFO] build 폴더 복사 완료"
elif [ -d "dist" ]; then
  echo "[INFO] dist 폴더 내용을 상위로 복사"
  cp -r dist/* .
  echo "[INFO] dist 폴더 복사 완료"
else
  echo "[WARNING] build 또는 dist 폴더를 찾을 수 없습니다"
fi

# index.html에 간단한 접근 제어 스크립트 추가
if [ -f "index.html" ]; then
  echo "[INFO] index.html에 접근 제어 스크립트 추가"
  
  # 간단한 접근 제어 스크립트
  ACCESS_SCRIPT="
    <script>
      // iframe이 아닌 직접 접근 시 홈으로 리다이렉트
      if (window.self === window.top) {
        window.location.href = '/';
      }
    </script>
  "
  
  # </head> 태그 앞에 스크립트 삽입
  cp index.html index.html.tmp
  sed -i "s#</head>#$ACCESS_SCRIPT\n</head>#" index.html.tmp
  mv index.html.tmp index.html
  echo "[INFO] index.html 접근 제어 스크립트 추가 완료"
else
  echo "[WARNING] index.html 파일을 찾을 수 없습니다"
fi

# === 디버깅: 최종 파일/폴더 구조 및 주요 파일 존재 여부 ===
echo "[DEBUG] 현재 디렉토리: $(pwd)"
echo "[DEBUG] index.html 존재 여부: $(ls -l index.html 2>/dev/null || echo '없음')"
echo "[DEBUG] build 디렉토리: $(ls -l build 2>/dev/null || echo '없음')"
echo "[DEBUG] dist 디렉토리: $(ls -l dist 2>/dev/null || echo '없음')"
echo "[DEBUG] package.json: $(ls -l package.json 2>/dev/null || echo '없음')"
echo "[DEBUG] node_modules: $(ls -l node_modules 2>/dev/null || echo '없음')"

echo "[INFO] chmod 755"
cd .. # 상위로 이동
chmod -R 755 "$FOLDER_NAME"

echo "[INFO] 최종 디렉토리 구조:"
find . -type f -name "*.js" -o -name "*.html" -o -name "*.css" | head -10

echo "[INFO] test_deploy.sh 완료"
exit 0