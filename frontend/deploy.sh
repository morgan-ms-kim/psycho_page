#!/bin/bash

# 강력한 배포 스크립트
echo "🚀 강력한 배포 시작..."

# 프로젝트 디렉토리로 이동
cd /var/www/html/wordpress/psycho_page

# Git pull
echo "📥 Git pull 중..."
git pull

# 프론트엔드 디렉토리로 이동
echo "📁 프론트엔드 디렉토리로 이동..."
cd frontend
# 빌드 (빠른 빌드 사용)
echo "🔨 빠른 빌드 중..."
npm run build:fast

# PM2 완전 재시작
echo "🔄 PM2 완전 재시작 중..."
#pm2 delete psycho-frontend
pm2 restart all
#start npm --name "psycho-frontend" -- start

echo "✅ 배포 완료!"
echo "🌐 https://smartpick.website/psycho_page 에서 확인하세요."
echo "💡 브라우저에서 Ctrl+F5로 강력 새로고침을 해주세요!" 
curl https://smartpick.website/psycho_page/