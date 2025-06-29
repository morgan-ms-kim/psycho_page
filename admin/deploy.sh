#!/bin/bash

# 강력한 배포 스크립트
echo "🚀 강력한 배포 시작..."

# 프로젝트 디렉토리로 이동
cd /var/www/html/wordpress/psycho_page

# Git pull
echo "📥 Git pull 중..."
git pull

# 프론트엔드 디렉토리로 이동
echo "📁 관리자 디렉토리로 이동..."
cd admin

# 완전한 캐시 삭제
#echo "🗑️ 캐시 삭제 중..."
#rm -rf .next
#rm -rf node_modules/.cache

# 의존성 재설치
#echo "📦 의존성 재설치 중..."
#rm -rf node_modules package-lock.json
#npm install

# 빌드
echo "🔨 빌드 중..."
npm run build

# PM2 완전 재시작
echo "🔄 PM2 완전 재시작 중..."
#pm2 delete psycho-frontend
pm2 restart all
#start npm --name "psycho-frontend" -- start

echo "✅ 강력한 배포 완료!"
echo "🌐 https://smartpick.website/psycho_page/admin 에서 확인하세요."
echo "💡 브라우저에서 Ctrl+F5로 강력 새로고침을 해주세요!" 
curl https://smartpick.website/psycho_page/admin