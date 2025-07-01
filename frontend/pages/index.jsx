import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import {
  MainWrap,
  Header,
  LoadingWrap,
  LoadingSpinner,
  ErrorMessage,
  Footer,
  PrimaryButton,
  SecondaryButton,
  Grid,
  FlexRow,
  Section,
  Title,
  SectionTitle,
  Card,
  Logo,
  Stats,
  StatItem,
  HistoryButton,
  SearchSection,
  SearchBar,
  SearchInput,
  SearchButton,
  FilterBar,
  CategorySelect,
  BannerStats
} from '../components/StyledComponents';
import Head from 'next/head';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'https://smartpick.website/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API 기본 URL - nginx 리버스 프록시 사용
const getApiBase = () => {
  // 타임스탬프를 추가하여 캐시 무효화
  const timestamp = Date.now();
  return `https://smartpick.website/api?t=${timestamp}`.replace('?t=', '');
};

// 리스트 영역 분리 컴포넌트
function TestListSection({ searching, sortedTests, loadingMore, error, searchTerm, selectedCategory, loadMore, getTestFolderName, router, getImagePath }) {
  if (searching) {
    return (
      <Section>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
          <p>검색 중...</p>
        </div>
      </Section>
    );
  }
  if (error) {
    return null; // 에러는 상위에서 처리
  }
  if (sortedTests.length > 0) {
    // hot/new 계산
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    // 조회수 상위 10개 id 추출
    const hotIds = sortedTests
      .slice()
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(t => t.id);
    return (
      <Section>
        <TestCount>총 {sortedTests.length}개의 테스트</TestCount>
        <Grid>
          {sortedTests.map((test) => {
            const isNew = new Date(test.createdAt).getTime() > weekAgo;
            const isHot = hotIds.includes(test.id);
            return (
              <Card 
                key={test.id} 
                onClick={() => {
                  try {
                    if (!test.id) {
                      console.error('테스트 ID가 없습니다:', test);
                      return;
                    }
                    const testPath = `/testview/${getTestFolderName(test.id)}`;
                    console.log('테스트 클릭:', testPath, '원본 ID:', test.id);
                    router.push(testPath);
                  } catch (error) {
                    console.error('테스트 클릭 에러:', error, '테스트 데이터:', test);
                  }
                }}
              >
                <TestCardContent>
                  <TestThumbnailContainer>
                    {test.thumbnail ? (
                      <TestItemImage  
                        src={getImagePath(test.thumbnail)} 
                        alt={test.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <TestItemPlaceholder style={{ display: test.thumbnail ? 'none' : 'flex' }}>
                      🧠
                    </TestItemPlaceholder>
                  </TestThumbnailContainer>
                  <TestContent>
                    <TestItemTitle>
                      {test.title}
                    </TestItemTitle>
                    <TestItemDesc>{test.description}</TestItemDesc>
                    {(isNew || isHot) && (
                      <div style={{ margin: '4px 0 8px 0', minHeight: 24 }}>
                        {isNew && <Badge type="new">NEW</Badge>}
                        {isHot && <Badge type="hot">HOT</Badge>}
                      </div>
                    )}
                    <TestItemStats>
                      <Stat>👁️ {test.views}</Stat>
                      <Stat>💖 {test.likes}</Stat>
                      <Stat>💬 {typeof test.comments === 'number' ? test.comments : 0}</Stat>
                    </TestItemStats>
                  </TestContent>
                </TestCardContent>
              </Card>
            );
          })}
        </Grid>
        {loadingMore && (
          <LoadingMore>
            <LoadingSpinner />
            <p>더 많은 테스트를 불러오는 중...</p>
          </LoadingMore>
        )}
      </Section>
    );
  }
  if (!searching && (searchTerm || selectedCategory)) {
    return (
      <NoResults>
        <h3>검색 결과가 없습니다</h3>
        <p>다른 검색어나 카테고리를 시도해보세요.</p>
      </NoResults>
    );
  }
  return null;
}

export default function Home() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sort, setSort] = useState('latest');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [visitorStats, setVisitorStats] = useState({ total: 0, today: 0, week: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('connecting'); // 'connecting', 'connected', 'failed'
  const router = useRouter();

  // URL 경로 정규화 - 중복 test 제거
  useEffect(() => {
    const currentPath = router.asPath;
    if (currentPath.includes('/tests/testtest')) {
      const normalizedPath = currentPath.replace('/tests/testtest', '/tests/test');
      console.log('URL 정규화:', currentPath, '->', normalizedPath);
      router.replace(normalizedPath);
    }
  }, [router.asPath, router]);

  // 이미지 경로를 올바르게 처리하는 함수
  const getImagePath = (path) => {
    if (!path) return null;
    return path;
  };

  // 테스트 ID를 폴더명으로 변환하는 함수
  const getTestFolderName = (testId) => {
    // testId가 문자열이 아닌 경우 문자열로 변환
    const id = String(testId);
    
    // 이미 test로 시작하는 경우 그대로 반환, 아니면 test 추가
    if (id.startsWith('test')) {
      return id;
    }
    return `test${id}`;
  };

  // 테스트 데이터 로드
  useEffect(() => {
    loadTests();
    loadVisitorStats();
    loadCategories();
  }, []);

  // 페이지 변경 시 추가 데이터 로드
  useEffect(() => {
    if (page > 1) {
      loadTests();
    }
  }, [page]);

  // 방문자 통계 로드
  const loadVisitorStats = async () => {
    try {
      // iframe 내부에서 실행 중인지 확인
      if (window.self !== window.top) {
        console.log('iframe 내부에서 실행 중 - API 호출 건너뜀');
        setVisitorStats({ 
          total: 15420, 
          today: 342, 
          week: 2156 
        });
        setApiStatus('failed');
        return;
      }

      const response = await apiClient.get('/visitors/count');
      setVisitorStats(response.data);
      setApiStatus('connected');
    } catch (error) {
      console.error('방문자 통계 로드 실패:', error);
      setApiStatus('failed');
      // API 연결 실패 시 기본 통계 제공
      setVisitorStats({ 
        total: 15420, 
        today: 342, 
        week: 2156 
      });
    }
  };

  // 카테고리 목록 로드
  const loadCategories = async () => {
    try {
      // iframe 내부에서 실행 중인지 확인
      if (window.self !== window.top) {
        console.log('iframe 내부에서 실행 중 - 카테고리 API 호출 건너뜀');
        setCategories([
          { id: '성격', name: '성격' },
          { id: '연애', name: '연애' },
          { id: '직업', name: '직업' },
          { id: '취미', name: '취미' },
          { id: '지능', name: '지능' },
          { id: '사회성', name: '사회성' }
        ]);
        return;
      }

      const response = await apiClient.get('/categories');
      
      // API 응답이 배열인 경우 카테고리 객체로 변환
      if (Array.isArray(response.data)) {
        const categoryObjects = response.data.map(category => ({
          id: category,
          name: category
        }));
        setCategories(categoryObjects);
      } else {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
      // API 연결 실패 시 기본 카테고리 제공
      setCategories([
        { id: '성격', name: '성격' },
        { id: '연애', name: '연애' },
        { id: '직업', name: '직업' },
        { id: '취미', name: '취미' },
        { id: '지능', name: '지능' },
        { id: '사회성', name: '사회성' }
      ]);
    }
  };

  // 테스트 데이터 로드
  const loadTests = async (reset = false) => {
    try {
      // iframe 내부에서 실행 중인지 확인 - 완전 차단
      if (window.self !== window.top) {
        console.log('iframe 내부에서 실행 중 - 모든 API 호출 차단');
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      if (reset) {
        setLoading(true);
        // 검색 시에는 에러 상태를 초기화하지 않음 (페이지 새로고침 방지)
        // setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: reset ? 1 : page,
        limit: 10,
        sort: sort
      });

      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
        console.log('검색 파라미터 추가:', searchTerm.trim());
      }
      if (selectedCategory) params.append('category', selectedCategory);

      // 타임아웃 설정 (5초)
      const response = await apiClient.get('/tests', {
        params: params
      });
      
      // 테스트 데이터 검증 및 로깅
      console.log('받은 테스트 데이터:', response.data);
      const validatedTests = response.data.map(test => {
        console.log('테스트 ID 타입:', typeof test.id, '값:', test.id);
        return {
          ...test,
          id: String(test.id) // ID를 문자열로 확실히 변환
        };
      });
      
      if (reset) {
        setTests(validatedTests);
      } else {
        // 중복 제거 로직 추가
        setTests(prev => {
          const existingIds = new Set(prev.map(test => test.id));
          const newTests = validatedTests.filter(test => !existingIds.has(test.id));
          return [...prev, ...newTests];
        });
      }
      
      setHasMore(response.data.length === 10);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('테스트 데이터 로드 실패:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
      setLoadingMore(false);
      
      // API 연결 실패 시 기본 테스트 데이터 제공
      if (reset && tests.length === 0) {
        setTests([
          {
            id: 'test1',
            title: '성격 유형 테스트',
            description: '당신의 성격 유형을 알아보세요',
            category: 'personality',
            views: 1250,
            likes: 89,
            comments: 23,
            createdAt: new Date().toISOString()
          },
          {
            id: 'test2',
            title: '연애 성향 테스트',
            description: '당신의 연애 스타일을 알아보세요',
            category: 'love',
            views: 980,
            likes: 67,
            comments: 15,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'test3',
            title: '직업 적성 테스트',
            description: '당신에게 맞는 직업을 찾아보세요',
            category: 'career',
            views: 756,
            likes: 45,
            comments: 12,
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
      }
    }
  };

  // 더 많은 테스트 로드 (무한 스크롤)
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // 검색 전용 함수 (리스트만 업데이트)
  const searchTests = async () => {
    try {
      console.log('검색 실행:', { searchTerm, selectedCategory, sort });
      setSearching(true);
      
      const params = new URLSearchParams({
        page: 1,
        limit: 10,
        sort: sort
      });

      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
        console.log('검색 파라미터 추가:', searchTerm.trim());
      }
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await apiClient.get('/tests', { params });
      
      const validatedTests = response.data.map(test => ({
        ...test,
        id: String(test.id)
      }));
      
      // 검색 결과만 업데이트 (전체 상태 초기화 없음)
      setTests(validatedTests);
      setHasMore(response.data.length === 10);
      setPage(1);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setSearching(false);
    }
  };

  // 검색어가 변경되면 검색 실행 (디바운스 적용)
  useEffect(() => {
    const timer = setTimeout(() => {
      searchTests();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sort]);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore]);

  // 중복 제거 및 정렬된 테스트 목록
  const uniqueTests = tests.reduce((acc, test) => {
    const existingTest = acc.find(t => t.id === test.id);
    if (!existingTest) {
      acc.push(test);
    }
    return acc;
  }, []);

  const sortedTests = [...uniqueTests].sort((a, b) => {
    if (sort === 'views') return b.views - a.views;
    if (sort === 'likes') return b.likes - a.likes;
    if (sort === 'popular') return (b.views + b.likes) - (a.views + a.likes);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // 배너 자동 슬라이드
  useEffect(() => {
    if (sortedTests.length > 0) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % Math.min(sortedTests.length, 5));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [sortedTests]);

  // 초기 로딩 시에만 전체 로딩 화면 표시
  if (loading && tests.length === 0) {
    return (
      <LoadingWrap>
        <LoadingSpinner />
        <p>테스트를 불러오는 중...</p>
      </LoadingWrap>
    );
  }

  return (
    <>
      <Head>
        <title>PSYCHO - 심리테스트</title>
      </Head>
      <MainWrap>
        <Section style={{
          maxWidth: 1200,
          margin: '32px auto 0 auto',
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 6px 32px rgba(80,80,120,0.10)',
          padding: '0 0 32px 0',
          minHeight: 120,
          position: 'relative'
        }}>
          <div id="kakao-ad-container"
            style={{
              width: '100%',
              minHeight: 60,
              textAlign: 'center',
              background: 'transparent',
              margin: 0,
              padding: '24px 0 0 0'
            }}
          />
          {/* 헤더 */}
          <Header>
            <Logo onClick={() => {
              // 검색 상태 초기화
              setSearchTerm('');
              setSelectedCategory('');
              setPage(1);
              setError(null);
              // 홈페이지로 이동
              router.push('/');
            }} style={{ cursor: 'pointer' }}>
              <span style={{ color: 'initial', filter: 'none' }}>🧠</span> PSYCHO
            </Logo>
            <Stats>
              <StatItem>👥 전체 방문자: {visitorStats.total.toLocaleString()}</StatItem>
              <StatItem>📊 오늘 방문자: {visitorStats.today.toLocaleString()}</StatItem>
              <StatItem>📈 주간 방문자: {visitorStats.week.toLocaleString()}</StatItem>
              <StatItem style={{ 
                color: apiStatus === 'connected' ? '#4CAF50' : 
                       apiStatus === 'failed' ? '#f44336' : '#ff9800',
                fontWeight: 'bold'
              }}>
                {apiStatus === 'connected' ? '🟢 서버 연결됨' : 
                 apiStatus === 'failed' ? '🔴 서버 연결 실패' : '🟡 연결 중...'}
              </StatItem>
            </Stats>
            <HistoryButton onClick={() => router.push('/history')}>
              📋 기록보기
            </HistoryButton>
          </Header>

          {/* 검색 및 필터 섹션 */}
          <SearchSection>
            <SearchBar>
              <SearchInput
                type="text"
                placeholder="테스트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchButton>🔍</SearchButton>
            </SearchBar>
            
            <FilterBar>
              <CategorySelect 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">모든 카테고리</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </CategorySelect>
              
              <SortSelect value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="latest">최신순</option>
                <option value="views">조회순</option>
                <option value="likes">좋아요순</option>
                <option value="popular">인기순</option>
              </SortSelect>
            </FilterBar>
          </SearchSection>

          {/* 에러 메시지 */}
          {error && (
            <ErrorMessage>
              <p>🚫 {error}</p>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                백엔드 서버 연결에 실패했습니다. 기본 테스트 데이터를 표시합니다.
              </p>
              <button onClick={() => {
                setError(null);
                loadTests(true);
                loadVisitorStats();
                loadCategories();
              }}>🔄 다시 시도</button>
            </ErrorMessage>
          )}

          {/* 리스트 영역만 분리 렌더링 */}
          <TestListSection
            searching={searching}
            sortedTests={sortedTests}
            loadingMore={loadingMore}
            error={error}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            loadMore={loadMore}
            getTestFolderName={getTestFolderName}
            router={router}
            getImagePath={getImagePath}
          />

          {/* 푸터 */}
          <Footer>
            <p>© 2025 PSYCHO - 재미있는 심리테스트 모음</p>
          </Footer>
        </Section>
      </MainWrap>
    </>
  );
}

// 페이지 전용 스타일 컴포넌트들
const SortSelect = styled.select`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  
  option {
    background: #333;
    color: white;
  }
`;

const LoadingMore = styled.div`
  text-align: center;
  padding: 2rem;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    opacity: 0.8;
  }
`;

const TestCount = styled.div`
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.8;
`;

const TestCardContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TestThumbnailContainer = styled.div`
  position: relative;
  margin-bottom: 15px;
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TestItemPlaceholder = styled.div`
  position: absolute;
  top: 50%;
  left: 20%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 180px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  transition: transform 0.3s ease;
  &:hover {
    transform: translate(-50%, -50%) scale(1.05);
  }
`;

const TestContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TestItemTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 8px 0;
  line-height: 1.3;
  font-weight: 600;
`;

const TestItemDesc = styled.p`
  font-size: 0.9rem;
  margin: 0 0 12px 0;
  opacity: 0.8;
  line-height: 1.4;
  flex: 1;
`;

const TestItemStats = styled.div`
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 8px;
`;

const Stat = styled.span``;

const TestItemImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 10px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const TestContainer = styled.div`
  width: 100%;
  max-width: 1800px;
  min-width: 600px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 40px rgba(80,80,120,0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TestIframe = styled.iframe`
  width: 100%;
  min-width: 600px;
  min-height: 800px;
  border: none;
  background: #fff;
  border-radius: 0 0 24px 24px;
  flex: 1;
  display: block;
`;

// 뱃지 스타일 추가
const Badge = styled.span`
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: bold;
  color: #fff;
  background: ${props => props.type === 'hot' ? '#ff5e5e' : '#7f7fd5'};
`;