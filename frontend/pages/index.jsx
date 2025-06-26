import { useState } from 'react';
import styled from 'styled-components';

const dummyBanners = [
  '/banner1.png', '/banner2.png', '/banner3.png', '/banner4.png', '/banner5.png',
  '/banner6.png', '/banner7.png', '/banner8.png', '/banner9.png', '/banner10.png',
];
const dummyTests = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  title: `심리테스트 ${i + 1}`,
  description: `이것은 심리테스트 ${i + 1}의 설명입니다.`,
  thumbnail: `/thumb${i + 1}.png`,
  views: Math.floor(Math.random() * 1000),
  likes: Math.floor(Math.random() * 500),
}));

const sortOptions = [
  { value: 'views', label: '조회순' },
  { value: 'likes', label: '추천순' },
  { value: 'latest', label: '최신순' },
];

export default function Home() {
  const [sort, setSort] = useState('views');
  const sortedTests = [...dummyTests].sort((a, b) => {
    if (sort === 'views') return b.views - a.views;
    if (sort === 'likes') return b.likes - a.likes;
    return b.id - a.id;
  });

  return (
    <MainWrap>
      <BannerSlider>
        {dummyBanners.map((src, i) => (
          <BannerImg key={i} src={src} alt={`배너${i+1}`} />
        ))}
      </BannerSlider>
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
          <Card key={test.id}>
            <Thumb src={test.thumbnail} alt={test.title} />
            <h3>{test.title}</h3>
            <p>{test.description}</p>
            <Info>
              <span>👁 {test.views}</span>
              <span>❤️ {test.likes}</span>
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
const BannerSlider = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 16px;
  margin-bottom: 32px;
  &::-webkit-scrollbar { display: none; }
`;
const BannerImg = styled.img`
  width: 260px;
  height: 120px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 2px 8px #ffb3e6aa;
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
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 6px 24px #6c63ff33;
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