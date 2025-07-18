import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import dayjs from 'dayjs';
import React from 'react'; // Added for React.Fragment

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });

export default function Analytics() {
  const router = useRouter();
  const [period, setPeriod] = useState('day');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitorList, setVisitorList] = useState([]);
  const [visitorLoading, setVisitorLoading] = useState(true);
  const today = dayjs().format('YYYY-MM-DD');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorTotal, setVisitorTotal] = useState(0);

  useEffect(() => {
    // 로그인 확인
    const token = localStorage.getItem('adminToken');
    if (!token) {
      if (validateAndFixPath('/', router)) {
        router.push('/');
      }
      return;
    }

    loadAnalytics();
  }, [router, period]);

  // 방문자 상세 리스트 로드
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setVisitorLoading(true);
        const res = await apiClient.get('/admin/visitors?page=1&limit=50');
        setVisitorList(res.data.visitors || []);
      } catch (e) {
        setVisitorList([]);
      } finally {
        setVisitorLoading(false);
      }
    };
    fetchVisitors();
  }, []);

  const loadAnalytics = async (customStart, customEnd) => {
    try {
      setLoading(true);
      let url = `/admin/analytics?period=${period}&limit=30`;
      if (customStart) url += `&start=${customStart}`;
      if (customEnd) url += `&end=${customEnd}`;
      const response = await apiClient.get(url);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('분석 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    // 히스토리를 완전히 초기화하고 로그인 페이지로 강제 이동
    window.location.href = '/admin';
  };

  const chartData = {
    labels: analyticsData.map(item => item.date).reverse(),
    datasets: [
      {
        label: '방문자 수',
        data: analyticsData.map(item => item.count).reverse(),
        borderColor: '#6a5acd',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '방문자 통계',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // 방문자 상세 리스트 로드 함수 (limit 없이 전체 불러오기)
  const fetchVisitors = async (customStart, customEnd) => {
    try {
      setVisitorLoading(true);
      let url = `/admin/visitors`;
      if (customStart) url += `?start=${customStart}`;
      if (customEnd) url += (customStart ? `&end=${customEnd}` : `?end=${customEnd}`);
      const res = await apiClient.get(url);
      setVisitorList(res.data.visitors || []);
      setVisitorTotal((res.data.visitors || []).length);
    } catch (e) {
      setVisitorList([]);
      setVisitorTotal(0);
    } finally {
      setVisitorLoading(false);
    }
  };

  // 기간 변경 핸들러
  const handlePeriodChange = (type, value) => {
    if (type === 'start') setStartDate(value);
    if (type === 'end') setEndDate(value);
  };

  // 기간 적용 버튼
  const handleApplyPeriod = () => {
    loadAnalytics(startDate, endDate);
    fetchVisitors(startDate, endDate);
  };

  // 전체 기간 버튼
  const handleAllPeriod = () => {
    setStartDate(''); setEndDate('');
    loadAnalytics('', '');
    fetchVisitors('', '');
  };

  // 진입 시 오늘 날짜로 자동 조회
  useEffect(() => {
    loadAnalytics('', '');
    fetchVisitors('', '');
  }, []);

  // visitorPage, startDate, endDate 변경 시 방문자 리스트 재요청 → 페이지 변경 시에는 전체 데이터에서 slice만
  // 페이지네이션, slice, visitorPage 등 관련 코드 제거

  // visitorList에서 50개씩 잘라서 보여줄 데이터
  const pagedVisitors = useMemo(() => {
    const start = (visitorPage - 1) * 50;
    return visitorList.slice(start, start + 50);
  }, [visitorList, visitorPage]);

  // IP별로 그룹핑 (페이지별 데이터만)
  const groupedVisitors = useMemo(() => {
    const map = {};
    pagedVisitors.forEach(v => {
      if (!map[v.ip]) map[v.ip] = [];
      map[v.ip].push(v);
    });
    return map;
  }, [pagedVisitors]);

  const [openedIps, setOpenedIps] = useState([]);

  // IP 접기/펼치기 토글
  const toggleIp = (ip) => {
    setOpenedIps(prev =>
      prev.includes(ip) ? prev.filter(i => i !== ip) : [...prev, ip]
    );
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
                router.push('/');
              }
            }
          }} style={{ cursor: 'pointer' }}> <Image src="/uploads/logo.png" alt="심풀 로고"
          layout="fixed" width={35} height={35} style={{ verticalAlign: 'middle' }} />
     심풀 관리자</Logo>
          <Nav>
            <NavLink href="/dashboard">대시보드</NavLink>
            <NavLink href="/tests">테스트 관리</NavLink>
            <NavLink 
              href="/analytics" 
              onClick={(e) => {
                if (router.pathname === '/analytics') {
                  e.preventDefault();
                }
              }}
            >
              방문자 분석
            </NavLink>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </Nav>
        </HeaderContent>
      </Header>

      <Main>
        <PageHeader>
          <PageTitle>방문자 분석</PageTitle>
          <PeriodSelector>
            <PeriodButton 
              active={period === 'day'} 
              onClick={() => setPeriod('day')}
            >
              일별
            </PeriodButton>
            <PeriodButton 
              active={period === 'week'} 
              onClick={() => setPeriod('week')}
            >
              주별
            </PeriodButton>
            <PeriodButton 
              active={period === 'month'} 
              onClick={() => setPeriod('month')}
            >
              월별
            </PeriodButton>
            <input type="date" value={startDate} onChange={e => handlePeriodChange('start', e.target.value)} style={{ marginLeft: 12, marginRight: 4 }} />
            ~
            <input type="date" value={endDate} onChange={e => handlePeriodChange('end', e.target.value)} style={{ marginLeft: 4, marginRight: 8 }} />
            <button onClick={handleApplyPeriod} style={{ marginRight: 8, padding: '0.3rem 0.8rem', borderRadius: 5, border: '1px solid #aaa', background: '#fff', cursor: 'pointer' }}>적용</button>
            <button onClick={handleAllPeriod} style={{ padding: '0.3rem 0.8rem', borderRadius: 5, border: '1px solid #aaa', background: '#f8f9fa', cursor: 'pointer' }}>전체 기간</button>
          </PeriodSelector>
        </PageHeader>

        <ChartCard>
          <ChartTitle>방문자 추이</ChartTitle>
          <ChartContainer>
            <Line data={chartData} options={chartOptions} />
          </ChartContainer>
        </ChartCard>

        <StatsGrid>
          <StatCard>
            <StatIcon>📊</StatIcon>
            <StatContent>
              <StatValue>{analyticsData.length}</StatValue>
              <StatLabel>분석 기간</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>👥</StatIcon>
            <StatContent>
              <StatValue>
                {analyticsData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
              </StatValue>
              <StatLabel>총 방문자</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>📈</StatIcon>
            <StatContent>
              <StatValue>{
                
                
                }
                {analyticsData.length > 0 
                  ? Math.round(analyticsData.reduce((sum, item) => sum + item.count, 0) / analyticsData.length)
                  : 0
                }
              </StatValue>
              <StatLabel>평균 방문자</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>🔥</StatIcon>
            <StatContent>
              <StatValue>
                {analyticsData.length > 0 
                  ? Math.max(...analyticsData.map(item => item.count))
                  : 0
                }
              </StatValue>
              <StatLabel>최고 방문자</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>

        <DataTable>
          <TableTitle>상세 데이터</TableTitle>
          <Table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>방문자 수</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </DataTable>

        {/* 방문자 상세 리스트 */}
        <DataTable style={{ marginTop: '2rem' }}>
          <TableTitle>방문자 상세 리스트</TableTitle>
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <button onClick={() => setVisitorPage(p => Math.max(1, p - 1))} disabled={visitorPage === 1}>이전</button>
            <span style={{ margin: '0 1rem' }}>{visitorPage} / {Math.max(1, Math.ceil(visitorTotal / 50))}</span>
            <button onClick={() => setVisitorPage(p => p + 1)} disabled={visitorPage >= Math.ceil(visitorTotal / 50)}>다음</button>
          </div>
          <Table>
            <thead>
              <tr>
                <th>국가</th>
                <th>IP</th>
                <th>구분</th>
                <th>방문 시각</th>
              </tr>
            </thead>
            <tbody>
              {visitorLoading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center' }}>로딩 중...</td></tr>
              ) : visitorList.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center' }}>방문자 데이터가 없습니다.</td></tr>
              ) : Object.entries(groupedVisitors).map(([ip, records]) => (
                <React.Fragment key={ip}>
                  <tr onClick={() => toggleIp(ip)} style={{ cursor: records.length > 1 ? 'pointer' : 'default', background: '#f5f5f5' }}>
                    <td>{records[0].country}{records[0].region ? ' / ' + records[0].region : ''}</td>
                    <td>{ip}</td>
                    <td>{records[0].isBot ? '🤖 봇' : '🧑 인간'}</td>
                    <td>{records[0].visitedAt ? new Date(records[0].visitedAt).toLocaleString('ko-KR') : '-'}</td>
                    {records.length > 1 ? (
                      <td style={{ color: '#6a5acd', fontWeight: 700 }}>
                        {openedIps.includes(ip) ? '▲' : `+${records.length - 1}`}
                      </td>
                    ) : <td></td>}
                  </tr>
                  {openedIps.includes(ip) && records.slice(1).map((v, i) => (
                    <tr key={v.id || i} style={{ background: '#fafafa' }}>
                      <td>{v.country}{v.region ? ' / ' + v.region : ''}</td>
                      <td>{v.ip}</td>
                      <td>{v.isBot ? '🤖 봇' : '🧑 인간'}</td>
                      <td>{v.visitedAt ? new Date(v.visitedAt).toLocaleString('ko-KR') : '-'}</td>
                      <td></td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </DataTable>
      </Main>
    </Container>
  );
}

const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #7f7fd5 0%, #86a8e7 100%);
`;

const Header = styled.header`
  background: transparent;
  box-shadow: none;
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
  width: 100vw;
  max-width: none;
  min-width: 0;
  margin: 0;
  box-sizing: border-box;
  @media (max-width: 900px) {
    padding: 1rem 0.5rem;
    max-width: none;
    width: 100vw;
  }
  @media (max-width: 600px) {
    padding: 0.5rem 0;
    max-width: none;
    width: 100vw;
  }
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

const PeriodSelector = styled.div`
  gap: 0.5rem;
`;

const PeriodButton = styled.button`
  background: ${props => props.active ? '#6a5acd' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 2px solid #6a5acd;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#5a6fd8' : '#f8f9fa'};
  }
`;

const ChartCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 900px) {
    padding: 1rem 0.5rem;
    min-width: 0;
    width: 100vw;
  }
  @media (max-width: 600px) {
    padding: 0.5rem 0;
    min-width: 0;
    width: 100vw;
  }
`;

const ChartTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const ChartContainer = styled.div`
  height: 400px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 2rem auto;
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
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 900px) {
    padding: 1rem 0.5rem;
    min-width: 0;
    width: 100vw;
  }
  @media (max-width: 600px) {
    padding: 0.5rem 0;
    min-width: 0;
    width: 100vw;
  }
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

const DataTable = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
  @media (max-width: 900px) {
    padding: 1rem 0.5rem;
    min-width: 0;
    width: 100vw;
  }
  @media (max-width: 600px) {
    padding: 0.5rem 0;
    min-width: 0;
    width: 100vw;
  }
`;

const TableTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 400px;
  @media (max-width: 600px) {
    min-width: 320px;
    font-size: 0.95rem;
  }
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
    word-break: break-all;
  }
  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
  }
  tr:hover {
    background: #f8f9fa;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #666;
`;