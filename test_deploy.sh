#!/bin/bash

LOGFILE="deploy.log"
exec > >(tee -a "$LOGFILE") 2>&1

# 인자로 받은 경로로 이동
CLONE_PATH="$1"

if [ -z "$CLONE_PATH" ]; then
  echo "[ERROR] clone path 인자가 필요합니다."
  exit 1
fi

echo "[INFO] 작업 디렉토리: $CLONE_PATH"

# 디렉토리 존재 확인
if [ ! -d "$CLONE_PATH" ]; then
  echo "[ERROR] 디렉토리가 존재하지 않습니다: $CLONE_PATH"
  exit 1
fi

cd "$CLONE_PATH" || {
  echo "[ERROR] 디렉토리로 이동할 수 없습니다: $CLONE_PATH"
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
  # 임시 파일 생성
  cp package.json package.json.tmp
  
  # homepage 필드 추가 (마지막 } 앞에 추가)
  sed -i 's/}$/  "homepage": "\/psycho_page\/frontend\/public\/tests\/'$(basename $(pwd))'\/",\n}/' package.json.tmp
  
  # 수정된 내용 확인
  echo "[INFO] 수정된 package.json:"
  cat package.json.tmp
  
  # 원본 파일 교체
  mv package.json.tmp package.json
  echo "[INFO] homepage 필드 추가 완료"
else
  echo "[INFO] homepage 필드가 이미 존재합니다."
  # homepage 필드 값 확인
  grep '"homepage"' package.json
fi

# vite.config.js 파일 확인 및 base 설정 추가
echo "[INFO] vite.config.js 파일 확인 중..."
if [ -f "vite.config.js" ]; then
  echo "[INFO] vite.config.js 파일이 발견되었습니다."
  
  # 현재 테스트 경로 생성
  TEST_PATH="/psycho_page/frontend/public/tests/$(basename $(pwd))/"
  
  # vite.config.js 내용 확인
  echo "[INFO] 현재 vite.config.js 내용:"
  cat vite.config.js
  
  # defineConfig 내부에 base 설정이 있는지 확인
  if ! grep -q "base:" vite.config.js; then
    echo "[INFO] base 설정이 없습니다. 추가합니다..."
    
    # 임시 파일 생성
    cp vite.config.js vite.config.js.tmp
    
    # defineConfig({ 다음에 base 설정 추가
    sed -i 's/defineConfig({/defineConfig({\n  base: "'$TEST_PATH'",/' vite.config.js.tmp
    
    # 수정된 내용 확인
    echo "[INFO] 수정된 vite.config.js:"
    cat vite.config.js.tmp
    
    # 원본 파일 교체
    mv vite.config.js.tmp vite.config.js
    echo "[INFO] vite.config.js base 설정 추가 완료"
  else
    echo "[INFO] base 설정이 이미 존재합니다."
    # base 설정 값 확인
    grep "base:" vite.config.js
  fi
else
  echo "[INFO] vite.config.js 파일이 없습니다."
fi

# Node.js 버전 확인
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
# build 폴더가 있으면 복사
if [ -d "build" ]; then
  echo "[INFO] build 폴더 내용을 상위로 복사"
  cp -r build/* .
  echo "[INFO] build 폴더 복사 완료"
# dist 폴더가 있으면 복사 (Vite 프로젝트)
elif [ -d "dist" ]; then
  echo "[INFO] dist 폴더 내용을 상위로 복사"
  cp -r dist/* .
  echo "[INFO] dist 폴더 복사 완료"
else
  echo "[WARNING] build 또는 dist 폴더를 찾을 수 없습니다"
fi

echo "[INFO] chmod 755"
chmod -R 755 "$CLONE_PATH"

echo "[INFO] 최종 디렉토리 구조:"
find . -type f -name "*.js" -o -name "*.html" -o -name "*.css" | head -10

echo "[INFO] test_deploy.sh 완료"
exit 0 