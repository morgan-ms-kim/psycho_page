import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

const apiClient = axios.create({
  //baseURL: 'http://localhost:4000/api',
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
  console.log('API 요청:', config.method?.toUpperCase(), config.url);
  return config;
});

// 응답 인터셉터로 인증 오류 처리
apiClient.interceptors.response.use(
  (response) => {
    console.log('API 응답 성공:', response.status);
    return response;
  },
  (error) => {
    console.error('API 응답 오류:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      // 히스토리를 완전히 초기화하고 로그인 페이지로 강제 이동
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// 경로 확인 및 수정 유틸리티 함수
const validateAndFixPath = (path, router) => {
  // 현재 경로 확인
  const currentPath = router.asPath;
  const basePath = '/admin';
  
  // 중복 경로 확인
  if (currentPath.includes(`${basePath}${basePath}`)) {
    console.warn('중복 경로 감지:', currentPath);
    // 중복 제거
    const cleanPath = currentPath.replace(`${basePath}${basePath}`, basePath);
    router.replace(cleanPath);
    return false;
  }
  
  // 올바른 경로인지 확인
  if (!currentPath.startsWith(basePath) && currentPath !== '/') {
    console.warn('잘못된 경로 감지:', currentPath);
    // 올바른 경로로 리다이렉트
    router.replace(`${basePath}${path}`);
    return false;
  }
  
  return true;
};

export default function TestManagement() {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info');
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);
  const [templateGitUrl, setTemplateGitUrl] = useState('');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templateCategory, setTemplateCategory] = useState('기타');
  const [templateLoading, setTemplateLoading] = useState(false);

  const [imagePaths, setImagePaths] = useState({}); // { [test.id]: resolvedImageUrl }
  useEffect(() => {
    // 로그인 확인
    const token = localStorage.getItem('adminToken');
    if (!token) {
      if (validateAndFixPath('/', router)) {
        router.push('/');
      }
      return;
    }
    loadTests();
    ImagePathsByLang();
  }, [router]);

  useEffect(() => {
    // 로그인 확인
    ImagePathsByLang();
  }, [tests]);
  const getThumbnailByLang = async (thumbnailPath) => {
    if (!thumbnailPath) return null;
  
    // 브라우저 언어 설정 확인
    const language = navigator.language || navigator.userLanguage;
  
    // 언어 코드 결정
    let langCode = 'en'; // 기본값
    if (language.startsWith('es')) {
      langCode = 'es';
    } else if (language.startsWith('ko')) {
      langCode = 'ko';
    }
    const homePage = 'https://smartpick.website/';
    //const ext = '.png';
    const ext = '.webp';
    const imgPath = `${homePage}${thumbnailPath}/${langCode}${ext}`;
    try {
   // const res = await fetch(imgPath, { method: 'HEAD' });
  
     //   const contentType = res.headers.get('Content-Type');
        
        console.log('lang:' , langCode,' img :',imgPath.split());
      //  console.log('img contentType : ', contentType);
      //  if (res.ok && contentType?.startsWith('image/')) {
        return imgPath.split();
       // }
      }catch (error) {
        console.warn(`Failed to fetch ${imgPath}`, error);
      }
  
      return null;
      
  };
  const ImagePathsByLang = async () => {
    const paths = {};
    for (const test of tests) {
      if (!test.thumbnail.includes('.')) {
        const path = await getThumbnailByLang(test.thumbnail);
        if (path) paths[test.id] = path;
      }
    }
    setImagePaths(paths);
  };

  const loadTests = async () => {
    try {
      console.log('🔄 테스트 목록 로드 시작');
      const response = await apiClient.get('/admin/tests');
      console.log('✅ 테스트 목록 로드 성공:', response.data);
      setTests(response.data);
    } catch (error) {
      console.error('❌ 테스트 로드 실패:', error);
      console.error('응답 데이터:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!confirm('정말로 이 테스트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/tests/${testId}`);
      showMessage('테스트가 삭제되었습니다.', 'success');
      loadTests(); // 목록 새로고침
    } catch (error) {
      console.error('테스트 삭제 실패:', error);
      showMessage('테스트 삭제에 실패했습니다: ' + (error.response?.data?.error || error.message), 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    // 히스토리를 완전히 초기화하고 로그인 페이지로 강제 이동
    router.push('/');
  };

  const showMessage = (message, type = 'info') => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 1000);
  };

  const handleCleanupOrphanFolders = async () => {
    setCleanupLoading(true);
    setCleanupResult(null);
    try {
      const res = await apiClient.post('/admin/cleanup-orphan-folders');
      setCleanupResult(res.data);
    } catch (e) {
      setCleanupResult({ success: false, message: '정리 실패', error: e.message });
    }
    setCleanupLoading(false);
  };


  if (loading) {
    return (
      <Container>
        <LoadingMessage>로딩 중...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo onClick={() => {
            if (router.pathname !== '/dashboard') {
              if (validateAndFixPath('/dashboard', router)) {
                router.push('/dashboard');
              }
            }
          }} style={{ cursor: 'pointer' }}> <Image src="/uploads/logo.png" alt="심풀 로고"
          layout="fixed" width={35} height={35} style={{ verticalAlign: 'middle' }} />
     심풀</Logo>
          <Nav>
            <NavLink href="/dashboard">대시보드</NavLink>
            <NavLink 
              href="/tests" 
              onClick={(e) => {
                if (router.pathname === '/tests') {
                  e.preventDefault();
                }
              }}
            >
              테스트 관리
            </NavLink>
            <NavLink href="/analytics">방문자 분석</NavLink>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </Nav>
        </HeaderContent>
      </Header>

      <Main>
        <PageHeader>
          <PageTitle>테스트 관리</PageTitle>
          <div style={{display:'flex',gap:'8px'}}>
            <AddButton href="/tests/add">➕ 새 테스트 추가</AddButton>
          </div>
          <button onClick={handleCleanupOrphanFolders} disabled={cleanupLoading} style={{marginLeft: 16}}>
            {cleanupLoading ? '정리 중...' : '등록되지 않은 폴더 정리'}
          </button>
          {cleanupResult && (
            <div style={{marginTop: 8, color: cleanupResult.success ? 'green' : 'red'}}>
              {cleanupResult.success
                ? `정리 완료: ${cleanupResult.deletedCount}개 폴더 삭제`
                : `오류: ${cleanupResult.message || cleanupResult.error}`}
            </div>
          )}
        </PageHeader>


        <TestsGrid>
  {tests.map((test) => {
    const path = imagePaths[test.id];
    const thumbnailSrc = (test.thumbnail && !test.thumbnail.includes('.'))
      ? path
      : test.thumbnail && !test.thumbnail.includes('default-thumb.png')
      ? `https://smartpick.website${test.thumbnail}`
      : null;
   // console.log(thumbnailSrc);
    return (
      <TestCard key={test.id}>
        <TestThumbnail>
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={test.title}
              width={200}
              height={200}
              style={{
                width: '100%',
                maxWidth: '500px',
                minWidth: '360px',
                height: 'auto',
              }}
            />
          ) : (
            <DefaultThumbnail>📊</DefaultThumbnail>
          )}
        </TestThumbnail>

        <TestInfo>
          <TestTitle>{test.title}</TestTitle>
          <TestDescription>{test.description}</TestDescription>
          <TestMeta>
            <MetaItem>카테고리: {test.category}</MetaItem>
            <MetaItem>조회수: {test.views?.toLocaleString() || 0}</MetaItem>
            <MetaItem>좋아요: {test.likes?.toLocaleString() || 0}</MetaItem>
          </TestMeta>
          <TestDate>
            생성일: {new Date(test.createdAt).toLocaleDateString()}
          </TestDate>
        </TestInfo>

        <TestActions>
          <ActionButton
            onClick={() => {
              console.log('수정 버튼 클릭:', test.id);
              window.location.href = `/admin/tests/${test.id}/edit`;
            }}
          >
            ✏️ 수정
          </ActionButton>
          <ActionButton
            onClick={() => {
              console.log('썸네일 버튼 클릭:', test.id);
              window.location.href = `/admin/tests/${test.id}/thumbnail`;
            }}
          >
            🖼️ 썸네일
          </ActionButton>
          <DeleteButton onClick={() => handleDeleteTest(test.id)}>
            🗑️ 삭제
          </DeleteButton>
        </TestActions>
      </TestCard>
    );
  })}
</TestsGrid>


        {tests.length === 0 && (
          <EmptyState>
            <EmptyIcon>📝</EmptyIcon>
            <EmptyTitle>등록된 테스트가 없습니다</EmptyTitle>
            <EmptyDesc>새 테스트를 추가해보세요!</EmptyDesc>
            <AddButton href="/tests/add">첫 번째 테스트 추가</AddButton>
          </EmptyState>
        )}
      </Main>
      
      {/* 팝업 모달 */}
      {showModal && (
        <Modal type={modalType}>
          <ModalContent>
            <ModalIcon>
              {modalType === 'success' && '✅'}
              {modalType === 'error' && '❌'}
              {modalType === 'info' && 'ℹ️'}
            </ModalIcon>
            <ModalMessage>{modalMessage}</ModalMessage>
          </ModalContent>
        </Modal>
      )}
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
  color: #6a5acd;
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
    color: #6a5acd;
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

const AddButton = styled(Link)`
  background: linear-gradient(45deg, #6a5acd, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const TemplateButton = styled.button`
  background: linear-gradient(45deg, #6a5acd, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const TestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 32px 32px;
  box-sizing: border-box;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 0 8px 24px 8px;
    max-width: 100vw;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 0 2vw 16px 2vw;
    max-width: 100vw;
  }
`;

const TestCard = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const TestThumbnail = styled.div`
  height: 200px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const DefaultThumbnail = styled.div`
  font-size: 4rem;
  color: #dee2e6;
`;

const TestInfo = styled.div`
  padding: 1.5rem;
`;

const TestTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const TestDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const TestMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.span`
  background: #f8f9fa;
  color: #666;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
`;

const TestDate = styled.div`
  color: #999;
  font-size: 0.8rem;
`;

const TestActions = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: #6a5acd;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 1;

  &:hover {
    background: #5a6fd8;
  }
`;

const DeleteButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 1;

  &:hover {
    background: #c0392b;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const EmptyDesc = styled.p`
  color: #666;
  margin-bottom: 2rem;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #666;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const ModalIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const ModalMessage = styled.p`
  font-size: 1rem;
  color: #333;
`;