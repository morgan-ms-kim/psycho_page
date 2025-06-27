import { useState, useEffect } from 'react';
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
  Card
} from '../components/StyledComponents';

// API 기본 URL - nginx 리버스 프록시 사용
const API_BASE = '/api';

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

  // 이미지 로드 실패 처리
  const handleImageError = (e) => {
    // 기본 이미지로 대체
    if (e.target.src.includes('thumb.png')) {
      e.target.src = '/default-thumb.png';
    } else if (e.target.src.includes('banner.png')) {
      e.target.src = '/default-banner.png';
    } else {
      e.target.style.display = 'none';
    }
  };

  // 테스트 데이터 로드
  useEffect(() => {
    loadTests();
    loadVisitorStats();
    loadCategories();
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
      const url = `${API_BASE}/visitors/count`;
      console.log('방문자 통계 요청 URL:', url);
      const response = await axios.get(url);
      setVisitorStats(response.data);
    } catch (error) {
      console.error('방문자 통계 로드 실패:', error);
    }
  };

  // 카테고리 목록 로드
  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    }
  };

  // 테스트 데이터 로드
  const loadTests = async (reset = false) => {
    try {
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

      const response = await axios.get(`${API_BASE}/tests?${params}`);
      
      if (reset) {
        setTests(response.data);
      } else {
        setTests(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === 10);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('테스트 데이터 로드 실패:', error);
      setError('테스트를 불러오는데 실패했습니다.');
      setLoading(false);
      setLoadingMore(false);
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

  // 정렬된 테스트 목록
  const sortedTests = [...tests].sort((a, b) => {
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
        </Stats>
        <HistoryButton onClick={() => window.location.href = '/psycho_page/history'}>
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
            <option value="">전체 카테고리</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </CategorySelect>
          
          <SortSelect value={sort} onChange={e => setSort(e.target.value)}>
            <option value="latest">최신순</option>
            <option value="views">조회순</option>
            <option value="likes">추천순</option>
            <option value="popular">인기순</option>
          </SortSelect>
        </FilterBar>
      </SearchSection>

      {/* 배너 섹션 */}
      {sortedTests.length > 0 && (
        <BannerSection>
          <BannerSlider>
            {sortedTests.slice(0, 5).map((test, i) => (
              <BannerSlide 
                key={test.id} 
                active={i === currentBanner}
                onClick={() => window.location.href = `/psycho_page/tests/${test.id}`}
              >
                <BannerImg src={test.thumbnail || '/default-banner.png'} alt={test.title} onError={handleImageError} />
                <BannerOverlay>
                  <BannerTitle>{test.title}</BannerTitle>
                  <BannerDesc>{test.description}</BannerDesc>
                  <BannerStats>
                    <span>👁 {test.views.toLocaleString()}</span>
                    <span>❤️ {test.likes.toLocaleString()}</span>
                    <span>💬 {test.commentCount || 0}</span>
                  </BannerStats>
                </BannerOverlay>
              </BannerSlide>
            ))}
          </BannerSlider>
          <BannerDots>
            {sortedTests.slice(0, 5).map((_, i) => (
              <Dot key={i} active={i === currentBanner} onClick={() => setCurrentBanner(i)} />
            ))}
          </BannerDots>
        </BannerSection>
      )}

      {/* 에러 메시지 */}
      {error && (
        <ErrorMessage>
          <p>{error}</p>
          <button onClick={() => loadTests(true)}>다시 시도</button>
        </ErrorMessage>
      )}

      {/* 테스트 목록 */}
      {sortedTests.length > 0 ? (
        <TestListContainer>
          <TestCount>총 {sortedTests.length}개의 테스트</TestCount>
          
          {/* 테스트 목록 - 두 개의 ul로 나누어 배치 */}
          <TestListSection>
            <SectionTitle>🔥 인기 테스트</SectionTitle>
            <TestList>
              {sortedTests.slice(0, Math.ceil(sortedTests.length / 2)).map(test => (
                <TestListItem key={test.id} onClick={() => window.location.href = `/psycho_page/tests/${test.id}`}>
                  <TestItemImage src={test.thumbnail || '/default-thumb.png'} alt={test.title} onError={handleImageError} />
                  <TestItemContent>
                    <TestItemTitle>{test.title}</TestItemTitle>
                    <TestItemDesc>{test.description}</TestItemDesc>
                    <TestItemStats>
                      <Stat>👁 {test.views.toLocaleString()}</Stat>
                      <Stat>❤️ {test.likes.toLocaleString()}</Stat>
                      <Stat>💬 {test.commentCount || 0}</Stat>
                    </TestItemStats>
                    <TestItemDate>{new Date(test.createdAt).toLocaleDateString()}</TestItemDate>
                  </TestItemContent>
                  <TestItemHover>
                    <span>테스트 시작하기 →</span>
                  </TestItemHover>
                </TestListItem>
              ))}
            </TestList>
          </TestListSection>

          <TestListSection>
            <SectionTitle>⭐ 추천 테스트</SectionTitle>
            <TestList>
              {sortedTests.slice(Math.ceil(sortedTests.length / 2)).map(test => (
                <TestListItem key={test.id} onClick={() => window.location.href = `/psycho_page/tests/${test.id}`}>
                  <TestItemImage src={test.thumbnail || '/default-thumb.png'} alt={test.title} onError={handleImageError} />
                  <TestItemContent>
                    <TestItemTitle>{test.title}</TestItemTitle>
                    <TestItemDesc>{test.description}</TestItemDesc>
                    <TestItemStats>
                      <Stat>👁 {test.views.toLocaleString()}</Stat>
                      <Stat>❤️ {test.likes.toLocaleString()}</Stat>
                      <Stat>💬 {test.commentCount || 0}</Stat>
                    </TestItemStats>
                    <TestItemDate>{new Date(test.createdAt).toLocaleDateString()}</TestItemDate>
                  </TestItemContent>
                  <TestItemHover>
                    <span>테스트 시작하기 →</span>
                  </TestItemHover>
                </TestListItem>
              ))}
            </TestList>
          </TestListSection>

          {/* 더 보기 로딩 */}
          {loadingMore && (
            <LoadingMore>
              <LoadingSpinner />
              <p>더 많은 테스트를 불러오는 중...</p>
            </LoadingMore>
          )}
        </TestListContainer>
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

// 스타일 컴포넌트들 (페이지 전용)
const Logo = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
`;

const StatItem = styled.span`
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(5px);
`;

const HistoryButton = styled(SecondaryButton)`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
`;

// 검색 및 필터 섹션
const SearchSection = styled.div`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
`;

const SearchBar = styled.div`
  display: flex;
  max-width: 600px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  overflow: hidden;
  backdrop-filter: blur(10px);
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: white;
  font-size: 1rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    outline: none;
  }
`;

const SearchButton = styled.button`
  padding: 1rem 1.5rem;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CategorySelect = styled.select`
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

// 더 보기 로딩
const LoadingMore = styled.div`
  text-align: center;
  padding: 2rem;
`;

// 검색 결과 없음
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

// 배너 섹션
const BannerSection = styled.div`
  margin: 2rem 0;
  position: relative;
`;

const BannerSlider = styled.div`
  position: relative;
  height: 300px;
  overflow: hidden;
  border-radius: 20px;
`;

const BannerSlide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${props => props.active ? 1 : 0};
  transition: opacity 0.5s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const BannerImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BannerOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: 2rem;
  color: white;
`;

const BannerTitle = styled.h2`
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
`;

const BannerDesc = styled.p`
  font-size: 1rem;
  margin: 0 0 1rem 0;
  opacity: 0.9;
`;

const BannerStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
`;

const BannerDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.active ? 'white' : 'rgba(255,255,255,0.3)'};
  cursor: pointer;
`;

// 테스트 목록
const TestListContainer = styled.div`
  padding: 2rem;
`;

const TestCount = styled.div`
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.8;
`;

const TestListSection = styled.div`
  margin-bottom: 3rem;
`;

const TestList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const TestListItem = styled.li`
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    
    .hover-content {
      opacity: 1;
    }
  }
`;

const TestItemImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 1rem;
`;

const TestItemContent = styled.div`
  position: relative;
  z-index: 1;
`;

const TestItemTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
`;

const TestItemDesc = styled.p`
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  opacity: 0.8;
  line-height: 1.4;
`;

const TestItemStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const Stat = styled.span`
  font-size: 0.8rem;
  opacity: 0.7;
`;

const TestItemDate = styled.div`
  font-size: 0.8rem;
  opacity: 0.6;
`;

const TestItemHover = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(5px);
  
  span {
    font-size: 1.1rem;
    font-weight: bold;
  }
`; 