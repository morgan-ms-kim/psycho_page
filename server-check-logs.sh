#!/bin/bash

# 서버용 로그 확인 스크립트
echo "🔍 서버 로그 확인 도구"
echo "========================"

# 백엔드 디렉토리로 이동
cd /var/www/html/wordpress/psycho_page/backend

# 로그 디렉토리 확인
if [ ! -d "logs" ]; then
    echo "❌ 로그 디렉토리가 없습니다."
    echo "백엔드 서버를 실행하면 로그가 생성됩니다."
    exit 1
fi

# 오늘 날짜
TODAY=$(date +%Y-%m-%d)
LOG_FILE="logs/server-${TODAY}.log"

echo "📅 오늘 날짜: $TODAY"
echo "📄 로그 파일: $LOG_FILE"

if [ -f "$LOG_FILE" ]; then
    echo ""
    echo "📋 최근 로그 (마지막 50줄):"
    echo "================================"
    tail -50 "$LOG_FILE"
else
    echo "❌ 오늘의 로그 파일이 없습니다."
    
    # 다른 로그 파일들 확인
    echo ""
    echo "📁 사용 가능한 로그 파일들:"
    ls -la logs/
fi

echo ""
echo "💡 실시간 로그 모니터링:"
echo "tail -f $LOG_FILE" 