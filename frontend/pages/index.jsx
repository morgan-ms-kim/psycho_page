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

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'https://smartpick.website/psycho_page/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API 기본 URL - nginx 리버스 프록시 사용
const getApiBase = () => {
  // 타임스탬프를 추가하여 캐시 무효화
  const timestamp = Date.now();
  return `https://smartpick.website/psycho_page/api?t=${timestamp}`.replace('?t=', '');
};

export default function Home() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
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
    // /tests/로 시작하는 경로를 /psycho_page/tests/로 변환
    if (path.startsWith('/tests/')) {
      return path.replace('/tests/', '/psycho_page/tests/');
    }
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
    
    // 30초마다 테스트 목록 갱신 (새 테스트 등록 시 바로 보이도록)
    const interval = setInterval(() => {
      loadTests(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // 검색어나 카테고리 변경 시 테스트 다시 로드
  useEffect(() => {
    setPage(1);
    setTests([]);
    setHasMore(true);
    loadTests(true);
  }, [searchTerm, selectedCategory, sort]);

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
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: reset ? 1 : page,
        limit: 10,
        sort: sort
      });

      if (searchTerm) params.append('search', searchTerm);
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
      loadTests();
    }
  };

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

  if (loading) {
    return (
      <LoadingWrap>
        <LoadingSpinner />
        <p>테스트를 불러오는 중...</p>
      </LoadingWrap>
    );
  }

  return (
    <MainWrap>
      {/* 헤더 */}
      <Header>
        <Logo>🧠 PSYCHO</Logo>
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

      {/* 테스트 목록 */}
      {sortedTests.length > 0 ? (
        <Section>
          <TestCount>총 {sortedTests.length}개의 테스트</TestCount>
          
          <Grid>
            {sortedTests.map((test) => (
              <Card 
                key={test.id} 
                onClick={() => {
                  try {
                    if (!test.id) {
                      console.error('테스트 ID가 없습니다:', test);
                      return;
                    }
                    const testPath = `/tests/${getTestFolderName(test.id)}`;
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
                    <TestItemTitle>{test.title}</TestItemTitle>
                    <TestItemDesc>{test.description}</TestItemDesc>
                    <TestItemStats>
                      <Stat>👁️ {test.views}</Stat>
                      <Stat>💖 {test.likes}</Stat>
                      <Stat>💬 {test.comments || 0}</Stat>
                    </TestItemStats>
                    <TestItemDate>
                      {new Date(test.createdAt).toLocaleDateString()}
                    </TestItemDate>
                  </TestContent>
                </TestCardContent>
              </Card>
            ))}
          </Grid>

          {loadingMore && (
            <LoadingMore>
              <LoadingSpinner />
              <p>더 많은 테스트를 불러오는 중...</p>
            </LoadingMore>
          )}
        </Section>
      ) : (
        <NoResults>
          <h3>검색 결과가 없습니다</h3>
          <p>다른 검색어나 카테고리를 시도해보세요.</p>
        </NoResults>
      )}

      {/* 푸터 */}
      <Footer>
        <p>© 2024 PSYCHO - 재미있는 심리테스트 모음</p>
      </Footer>


    </MainWrap>
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
`;

const TestItemPlaceholder = styled.div`
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
    transform: scale(1.05);
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

const TestItemDate = styled.div`
  font-size: 0.8rem;
  opacity: 0.6;
  margin-top: auto;
`;

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