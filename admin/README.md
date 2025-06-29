# PSYCHO 관리자 페이지

## 설치 및 실행

### 1. 의존성 설치
```bash
cd admin
npm install
```

### 2. 환경변수 설정
백엔드 `.env` 파일에 다음 설정을 추가하세요:

```env
# 관리자 계정 설정
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
ADMIN_TOKEN=your_secret_admin_token
```

### 3. 개발 서버 실행
```bash
npm run dev
```

관리자 페이지는 `http://localhost:3001/admin`에서 접근할 수 있습니다.

## 기능

### 1. 로그인
- 아이디/비밀번호를 통한 관리자 인증
- JWT 토큰 기반 세션 관리

### 2. 대시보드
- 전체 통계 요약 (테스트 수, 조회수, 좋아요, 댓글, 방문자)
- 빠른 작업 링크

### 3. 테스트 관리
- 등록된 테스트 목록 조회
- 새 테스트 추가 (Git 저장소에서 클론)
- 테스트 정보 수정
- 썸네일 업로드
- 테스트 삭제

### 4. 방문자 분석
- 일별/주별/월별 방문자 통계
- 차트 시각화
- 상세 데이터 테이블

## 새 테스트 추가 과정

1. **Git 저장소 URL 입력**
   - React/Next.js 테스트가 포함된 Git 저장소 URL 입력
   - 예: `https://github.com/username/test-repo.git`

2. **자동 처리 과정**
   - Git에서 코드 클론
   - package.json에 homepage 설정 추가
   - npm install로 의존성 설치
   - npm run build로 빌드
   - 데이터베이스에 테스트 정보 저장

3. **테스트 정보 입력**
   - 제목, 설명, 카테고리 설정
   - 썸네일 이미지 업로드 (선택사항)

## API 엔드포인트

### 관리자 인증
- `POST /api/admin/login` - 관리자 로그인

### 테스트 관리
- `GET /api/admin/tests` - 테스트 목록 조회
- `POST /api/admin/tests` - 새 테스트 추가
- `POST /api/admin/tests/:id/thumbnail` - 썸네일 업로드

### 방문자 분석
- `GET /api/admin/analytics` - 방문자 통계
- `GET /api/admin/visitors` - 방문자 상세 로그

## 보안

- 모든 관리자 API는 Bearer 토큰 인증 필요
- 환경변수로 관리자 계정 정보 관리
- 세션 기반 인증 (localStorage 사용)

## 배포

### 프로덕션 빌드
```bash
npm run build
npm start
```

### nginx 설정
```nginx
location /admin {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
``` 