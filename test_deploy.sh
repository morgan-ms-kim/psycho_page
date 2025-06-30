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
  sed -i 's/}$/  "homepage": "\/psycho_page\/tests\/'"$FOLDER_NAME"'\/",\n}/' package.json.tmp
  echo "[INFO] 수정된 package.json:"
  cat package.json.tmp
  mv package.json.tmp package.json
  echo "[INFO] homepage 필드 추가 완료"
else
  echo "[INFO] homepage 필드가 이미 존재합니다."
  grep '"homepage"' package.json
fi

# vite.config.js 파일 확인 및 base 설정 추가
echo "[INFO] vite.config.js 파일 확인 중..."
if [ -f "vite.config.js" ]; then
  echo "[INFO] vite.config.js 파일이 발견되었습니다."
  TEST_PATH="/psycho_page/frontend/public/tests/$FOLDER_NAME/"
  # 실제 서비스 경로(슬래시 없이)도 계산
  SERVICE_PATH="/psycho_page/frontend/public/tests/$FOLDER_NAME"
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

# src/App.jsx의 <Router> 또는 <BrowserRouter>를 <BrowserRouter basename="SERVICE_PATH">로 자동 치환
APP_FILE="src/App.jsx"
if [ -f "$APP_FILE" ]; then
  echo "[INFO] $APP_FILE 파일에서 Router basename 자동 치환"
  sed -i "s#<Router>#<BrowserRouter basename=\"$SERVICE_PATH\">#" "$APP_FILE"
  sed -i "s#<BrowserRouter>#<BrowserRouter basename=\"$SERVICE_PATH\">#" "$APP_FILE"
  echo "[INFO] 수정된 src/App.jsx Router 부분:"
  grep "Router basename=" "$APP_FILE"
else
  echo "[WARNING] $APP_FILE 파일이 없습니다."
fi

echo "[INFO] 빌드 전 vite.config.js:"
cat vite.config.js
echo "[INFO] 빌드 전 src/App.jsx Router 부분:"
grep "Router" src/App.jsx

echo "[INFO] Node.js 버전:"
node --version
echo "[INFO] npm 버전:"
npm --version

echo "[INFO] npm install 시작"
npm install
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

echo "[INFO] chmod 755"
chmod -R 755 "$FOLDER_NAME"

echo "[INFO] 최종 디렉토리 구조:"
find . -type f -name "*.js" -o -name "*.html" -o -name "*.css" | head -10

echo "[INFO] test_deploy.sh 완료"
exit 0 