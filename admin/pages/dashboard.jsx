import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Link from 'next/link';

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

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalTests: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    todayVisitors: 0,
    weekVisitors: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로그인 확인
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/');
      return;
    }

    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const [statsResponse, visitorsResponse] = await Promise.all([
        apiClient.get('/stats'),
        apiClient.get('/visitors/count')
      ]);

      setStats({
        ...statsResponse.data,
        todayVisitors: visitorsResponse.data.today,
        weekVisitors: visitorsResponse.data.week
      });
    } catch (error) {
      console.error('통계 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    // 히스토리를 완전히 초기화하고 로그인 페이지로 강제 이동
    router.push('/');
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
     심풀 관리자</Logo>
          <Nav>
            <NavLink 
              href="/dashboard" 
              onClick={(e) => {
                if (router.pathname === '/dashboard') {
                  e.preventDefault();
                }
              }}
            >
              대시보드
            </NavLink>
            <NavLink href="/tests">테스트 관리</NavLink>
            <NavLink href="/analytics">방문자 분석</NavLink>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </Nav>
        </HeaderContent>
      </Header>

      <Main>
        <PageTitle>대시보드</PageTitle>

        <StatsGrid>
          <StatCard>
            <StatIcon>📊</StatIcon>
            <StatContent>
              <StatValue>{stats.totalTests}</StatValue>
              <StatLabel>총 테스트</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>👀</StatIcon>
            <StatContent>
              <StatValue>{stats.totalViews.toLocaleString()}</StatValue>
              <StatLabel>총 조회수</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>❤️</StatIcon>
            <StatContent>
              <StatValue>{stats.totalLikes.toLocaleString()}</StatValue>
              <StatLabel>총 좋아요</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>💬</StatIcon>
            <StatContent>
              <StatValue>{stats.totalComments.toLocaleString()}</StatValue>
              <StatLabel>총 댓글</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>📈</StatIcon>
            <StatContent>
              <StatValue>{stats.todayVisitors.toLocaleString()}</StatValue>
              <StatLabel>오늘 방문자</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>📊</StatIcon>
            <StatContent>
              <StatValue>{stats.weekVisitors.toLocaleString()}</StatValue>
              <StatLabel>주간 방문자</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>

        <QuickActions>
          <SectionTitle>빠른 작업</SectionTitle>
          <ActionGrid>
            <ActionCard href="/tests/add">
              <ActionIcon>➕</ActionIcon>
              <ActionTitle>새 테스트 추가</ActionTitle>
              <ActionDesc>Git 저장소에서 테스트를 가져와 등록합니다</ActionDesc>
            </ActionCard>

            <ActionCard href="/tests">
              <ActionIcon>📝</ActionIcon>
              <ActionTitle>테스트 관리</ActionTitle>
              <ActionDesc>등록된 테스트들을 확인하고 관리합니다</ActionDesc>
            </ActionCard>

            <ActionCard href="/analytics">
              <ActionIcon>📊</ActionIcon>
              <ActionTitle>방문자 분석</ActionTitle>
              <ActionDesc>상세한 방문자 통계를 확인합니다</ActionDesc>
            </ActionCard>
          </ActionGrid>
        </QuickActions>
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

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 3rem auto;
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

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  font-size: 2rem;
`;

const StatContent = styled.div``;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const QuickActions = styled.div`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

const ActionCard = styled(Link)`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ActionIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const ActionTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const ActionDesc = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #666;
`;