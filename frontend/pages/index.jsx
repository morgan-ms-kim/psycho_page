import { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// API 기본 URL
const API_BASE = '/psycho-api';

export default function Home() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('latest');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [visitorStats, setVisitorStats] = useState({ total: 0, today: 0 });

  // 테스트 데이터 로드
  useEffect(() => {
    loadTests();
    loadVisitorStats();
  }, []);

  // 방문자 통계 로드
  const loadVisitorStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/visitors/count`);
      setVisitorStats(response.data);
    } catch (error) {
      console.error('방문자 통계 로드 실패:', error);
    }
  };

  // 테스트 데이터 로드
  const loadTests = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tests`);
      setTests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('테스트 데이터 로드 실패:', error);
      setLoading(false);
    }
  };

  // 정렬된 테스트 목록
  const sortedTests = [...tests].sort((a, b) => {
    if (sort === 'views') return b.views - a.views;
    if (sort === 'likes') return b.likes - a.likes;
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
        </Stats>
      </Header>

      {/* 배너 섹션 */}
      {sortedTests.length > 0 && (
        <BannerSection>
          <BannerSlider>
            {sortedTests.slice(0, 5).map((test, i) => (
              <BannerSlide 
                key={test.id} 
                active={i === currentBanner}
                onClick={() => window.location.href = `/psycho/${test.id}`}
              >
                <BannerImg src={test.thumbnail || '/default-banner.png'} alt={test.title} />
                <BannerOverlay>
                  <BannerTitle>{test.title}</BannerTitle>
                  <BannerDesc>{test.description}</BannerDesc>
                  <BannerStats>
                    <span>👁 {test.views.toLocaleString()}</span>
                    <span>❤️ {test.likes.toLocaleString()}</span>
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

      {/* 정렬 및 필터 */}
      <ControlBar>
        <SortSelect value={sort} onChange={e => setSort(e.target.value)}>
          <option value="latest">최신순</option>
          <option value="views">조회순</option>
          <option value="likes">추천순</option>
        </SortSelect>
        <TestCount>총 {sortedTests.length}개의 테스트</TestCount>
      </ControlBar>

      {/* 테스트 카드 그리드 */}
      <CardGrid>
        {sortedTests.map(test => (
          <TestCard key={test.id} onClick={() => window.location.href = `/psycho/${test.id}`}>
            <CardImage src={test.thumbnail || '/default-thumb.png'} alt={test.title} />
            <CardContent>
              <CardTitle>{test.title}</CardTitle>
              <CardDesc>{test.description}</CardDesc>
              <CardStats>
                <Stat>👁 {test.views.toLocaleString()}</Stat>
                <Stat>❤️ {test.likes.toLocaleString()}</Stat>
                <Stat>💬 {test.commentCount || 0}</Stat>
              </CardStats>
              <CardDate>{new Date(test.createdAt).toLocaleDateString()}</CardDate>
            </CardContent>
            <CardHover>
              <span>테스트 시작하기 →</span>
            </CardHover>
          </TestCard>
        ))}
      </CardGrid>

      {/* 푸터 */}
      <Footer>
        <p>© 2024 PSYCHO - 재미있는 심리테스트 모음</p>
      </Footer>
    </MainWrap>
  );
}

// 스타일 컴포넌트들
const MainWrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
`;

const Logo = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
`;

const Stats = styled.div`
  display: flex;
  gap: 20px;
`;

const StatItem = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const BannerSection = styled.div`
  margin: 40px 0;
  position: relative;
`;

const BannerSlider = styled.div`
  display: flex;
  overflow: hidden;
  border-radius: 20px;
  margin: 0 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;

const BannerSlide = styled.div`
  min-width: 100%;
  position: relative;
  cursor: pointer;
  transition: transform 0.5s ease;
  transform: translateX(-${props => props.active * 100}%);
`;

const BannerImg = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
`;

const BannerOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: 40px 30px 30px;
`;

const BannerTitle = styled.h2`
  font-size: 1.8rem;
  margin: 0 0 10px 0;
`;

const BannerDesc = styled.p`
  font-size: 1rem;
  margin: 0 0 15px 0;
  opacity: 0.9;
`;

const BannerStats = styled.div`
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
`;

const BannerDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? 'white' : 'rgba(255,255,255,0.3)'};
  cursor: pointer;
  transition: background 0.3s;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 40px 30px;
`;

const SortSelect = styled.select`
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 1rem;
  
  option {
    background: #333;
    color: white;
  }
`;

const TestCount = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  padding: 0 40px 40px;
`;

const TestCard = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    
    .card-hover {
      opacity: 1;
    }
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0 0 10px 0;
`;

const CardDesc = styled.p`
  font-size: 0.9rem;
  margin: 0 0 15px 0;
  opacity: 0.8;
  line-height: 1.4;
`;

const CardStats = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
`;

const Stat = styled.span`
  font-size: 0.8rem;
  opacity: 0.7;
`;

const CardDate = styled.div`
  font-size: 0.8rem;
  opacity: 0.6;
`;

const CardHover = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 1.1rem;
  font-weight: bold;
`;

const Footer = styled.footer`
  text-align: center;
  padding: 40px;
  background: rgba(0,0,0,0.2);
  margin-top: 40px;
  
  p {
    margin: 0;
    opacity: 0.7;
  }
`; 