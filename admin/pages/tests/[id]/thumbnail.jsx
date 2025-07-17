import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Link from 'next/link';
import ThumbnailUploader from '../../../components/ThumbnailUploader';
import Image from 'next/image';

const apiClient = axios.create({
  baseURL: 'https://smartpick.website/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터로 토큰 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터로 인증 오류 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

export default function ThumbnailTest() {
  const router = useRouter();
  const { id } = router.query;
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      loadTest();
    }
  }, [id]);

  const loadTest = async () => {
    try {
      const response = await apiClient.get(`/admin/tests/${id}`);
      console.log('✅ 테스트 로드 성공:', response.data);
      console.log('📁 썸네일 경로:', response.data.thumbnail);
      setTest(response.data);
      // 이미지 상태 초기화
      if (response.data.thumbnail) {
        setImageLoading(true);
        setImageError(false);
      }
    } catch (error) {
      console.error('테스트 로드 실패:', error);
      setError('테스트를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (thumbnailPath) => {
    setMessage('썸네일이 성공적으로 업로드되었습니다!');
    setTest(prev => ({ ...prev, thumbnail: thumbnailPath }));
    
    // 3초 후 메시지 제거
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    
    // 5초 후 에러 메시지 제거
    setTimeout(() => setError(''), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/');
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>로딩 중...</LoadingMessage>
      </Container>
    );
  }

  if (error && !test) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
        <BackButton onClick={() => router.push('/tests')}>
          목록으로 돌아가기
        </BackButton>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          🧩심풀
          </Logo>
          <Nav>
            <NavLink href="/dashboard">대시보드</NavLink>
            <NavLink href="/tests">테스트 관리</NavLink>
            <NavLink href="/analytics">방문자 분석</NavLink>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </Nav>
        </HeaderContent>
      </Header>

      <Main>
        <PageHeader>
          <PageTitle>썸네일 관리</PageTitle>
          <BackButton onClick={() => router.push('/tests')}>
            ← 목록으로
          </BackButton>
        </PageHeader>

        {message && <SuccessMessage>{message}</SuccessMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {test && (
          <TestInfo>
            <TestTitle>{test.title}</TestTitle>
            <TestDescription>{test.description}</TestDescription>
            <TestMeta>
              <MetaItem>ID: {test.id}</MetaItem>
              <MetaItem>카테고리: {test.category}</MetaItem>
              <MetaItem>조회수: {test.views?.toLocaleString() || 0}</MetaItem>
            </TestMeta>
          </TestInfo>
        )}

        {test && (
          <ThumbnailUploader
            testId={test.id}
            testTitle={test.title}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        )}

        {test?.thumbnail && (
          <CurrentThumbnail>
            <h3>현재 썸네일</h3>
            {imageLoading && <ThumbnailLoading>🔄 이미지 로딩 중...</ThumbnailLoading>}
            <Image 
              src={test.thumbnail} 
              width={200}
              height={200}
              alt="현재 썸네일"
              style={{ width: '100%', maxWidth: '500px', minWidth: '360px', height: 'auto' }}
              onLoad={() => {
                console.log('✅ 썸네일 이미지 로딩 성공:', test.thumbnail);
                setImageLoading(false);
                setImageError(false);
              }}
              onError={(e) => {
                console.error('❌ 썸네일 이미지 로딩 실패:', test.thumbnail);
                setImageLoading(false);
                setImageError(true);
                e.target.style.display = 'none';
              }}
            />
            {imageError && (
              <ThumbnailError>
                ❌ 이미지를 불러올 수 없습니다
                <br />
                <small>경로: {test.thumbnail}</small>
              </ThumbnailError>
            )}
            <ThumbnailPath>{test.thumbnail}</ThumbnailPath>
            <ThumbnailUrl>
              <strong>전체 URL:</strong> https://smartpick.website{test.thumbnail}
            </ThumbnailUrl>
          </CurrentThumbnail>
        )}
      </Main>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #667eea;
  }
`;

const LogoutButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #c0392b;
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #5a6268;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const TestInfo = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TestTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const TestDescription = styled.p`
  color: #666;
  margin-bottom: 1rem;
`;

const TestMeta = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  color: #888;
  font-size: 0.9rem;
`;

const CurrentThumbnail = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  margin-top: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;

  h3 {
    margin-bottom: 1rem;
    color: #333;
  }
`;

const ThumbnailLoading = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const ThumbnailError = styled.div`
  color: #721c24;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const ThumbnailPath = styled.p`
  color: #666;
  font-size: 0.9rem;
  word-break: break-all;
`;

const ThumbnailUrl = styled.div`
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
`; 