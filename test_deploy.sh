#!/bin/bash

# 인자로 받은 경로로 이동
CLONE_PATH="$1"

if [ -z "$CLONE_PATH" ]; then
  echo "[ERROR] clone path 인자가 필요합니다."
  exit 1
fi

cd "$CLONE_PATH" || exit 1

echo "[INFO] npm install 시작"
npm install
if [ $? -ne 0 ]; then
  echo "[ERROR] npm install 실패"
  exit 2
fi

echo "[INFO] npm run build 시작"
npm run build
if [ $? -ne 0 ]; then
  echo "[ERROR] npm run build 실패"
  exit 3
fi

echo "[INFO] chmod 755"
chmod -R 755 "$CLONE_PATH"

exit 0 