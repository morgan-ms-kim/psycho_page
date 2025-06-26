import { useState, useEffect } from 'react';
import styled from 'styled-components';

// 실제 테스트 데이터 (나중에 API로 대체 가능)
const testData = [
  {
    id: 'test1',
    title: '오락실 캐릭터 유형 테스트',
    description: '레트로 오락실 감성의 캐릭터 유형 심리테스트',
    thumbnail: '/tests/test1/thumb.png',
    banner: '/tests/test1/banner.png',
    views: 1247,
    likes: 89,
  },
  {
    id: 'test2',
    title: '나의 하루 루틴 테스트',
    description: '나의 하루 습관과 루틴을 알아보는 심리테스트',
    thumbnail: '/tests/test2/thumb.png',
    banner: '/tests/test2/banner.png',
    views: 892,
    likes: 156,
  },
  {
    id: 'test3',
    title: 'MBTI 성격 유형 테스트',
    description: '나의 MBTI 성격 유형을 알아보는 심리테스트',
    thumbnail: '/tests/test3/thumb.png',
    banner: '/tests/test3/banner.png',
    views: 2156,
    likes: 234,
  },
  {
    id: 'test4',
    title: '연애 스타일 테스트',
    description: '나의 연애 스타일과 성향을 알아보는 심리테스트',
    thumbnail: '/tests/test4/thumb.png',
    banner: '/tests/test4/banner.png',
    views: 1893,
    likes: 167,
  },
  {
    id: 'test5',
    title: '직업 적성 테스트',
    description: '나에게 맞는 직업과 적성을 알아보는 심리테스트',
    thumbnail: '/tests/test5/thumb.png',
    banner: '/tests/test5/banner.png',
    views: 1456,
    likes: 98,
  },
];

const bannerData = [
  {
    id: 1,
    title: '오락실 캐릭터 유형 테스트',
    image: '/tests/test1/banner.png',
    link: '/psycho/test1'
  },
  {
    id: 2,
    title: '나의 하루 루틴 테스트',
    image: '/tests/test2/banner.png',
    link: '/psycho/test2'
  },
  {
    id: 3,
    title: 'MBTI 성격 유형 테스트',
    image: '/tests/test3/banner.png',
    link: '/psycho/test3'
  },
  {
    id: 4,
    title: '연애 스타일 테스트',
    image: '/tests/test4/banner.png',
    link: '/psycho/test4'
  },
  {
    id: 5,
    title: '직업 적성 테스트',
    image: '/tests/test5/banner.png',
    link: '/psycho/test5'
  },
];

const sortOptions = [
  { value: 'views', label: '조회순' },
  { value: 'likes', label: '추천순' },
  { value: 'latest', label: '최신순' },
];

export default function Home() {
  const [sort, setSort] = useState('views');
  const [currentBanner, setCurrentBanner] = useState(0);

  const sortedTests = [...testData].sort((a, b) => {
    if (sort === 'views') return b.views - a.views;
    if (sort === 'likes') return b.likes - a.likes;
    return b.id.localeCompare(a.id);
  });

  // 배너 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MainWrap>
      <BannerSection>
        <BannerSlider>
          {bannerData.map((banner, i) => (
            <BannerSlide 
              key={banner.id} 
              active={i === currentBanner}
              onClick={() => window.location.href = banner.link}
            >
              <BannerImg src={banner.image} alt={banner.title} />
              <BannerTitle>{banner.title}</BannerTitle>
            </BannerSlide>
          ))}
        </BannerSlider>
        <BannerDots>
          {bannerData.map((_, i) => (
            <Dot key={i} active={i === currentBanner} onClick={() => setCurrentBanner(i)} />
          ))}
        </BannerDots>
      </BannerSection>

      <SortBar>
        <label>정렬: </label>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </SortBar>

      <CardGrid>
        {sortedTests.map(test => (
          <Card key={test.id} onClick={() => window.location.href = `/psycho/${test.id}`}>
            <Thumb src={test.thumbnail} alt={test.title} />
            <h3>{test.title}</h3>
            <p>{test.description}</p>
            <Info>
              <span>👁 {test.views.toLocaleString()}</span>
              <span>❤️ {test.likes.toLocaleString()}</span>
            </Info>
          </Card>
        ))}
      </CardGrid>
    </MainWrap>
  );
}

const MainWrap = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 8px;
`;
const BannerSection = styled.div`
  margin-bottom: 32px;
  position: relative;
`;
const BannerSlider = styled.div`
  display: flex;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
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
  height: 200px;
  object-fit: cover;
`;
const BannerTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  padding: 20px 16px 16px;
  font-size: 1.2rem;
  font-weight: bold;
`;
const BannerDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
`;
const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? '#ff5e5e' : '#ddd'};
  cursor: pointer;
  transition: background 0.3s;
`;
const SortBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 1.1rem;
  select {
    margin-left: 8px;
    border-radius: 8px;
    padding: 4px 12px;
    border: 1px solid #ffe066;
    background: #fffbe7;
    font-size: 1rem;
  }
`;
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;
const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #00e0ca33;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    box-shadow: 0 6px 24px #6c63ff33;
    transform: translateY(-2px);
  }
`;
const Thumb = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 16px;
  object-fit: cover;
  margin-bottom: 12px;
`;
const Info = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 1.1rem;
`; 