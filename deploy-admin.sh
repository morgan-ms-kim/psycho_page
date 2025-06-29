#!/bin/bash

echo "🚀 관리자 페이지 재배포 시작"
echo "================================"

# 관리자 디렉토리로 이동
cd /var/www/html/wordpress/psycho_page/admin

echo "📦 의존성 설치 중..."
npm install

echo "🔨 빌드 중..."
npm run build

echo "🔄 PM2 재시작 중..."
pm2 restart admin

echo "✅ 관리자 페이지 재배포 완료!"
echo ""
echo "💡 브라우저에서 강제 새로고침 (Ctrl+F5) 후 테스트해보세요." 