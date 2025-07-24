import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import {
  MainWrap,
  Header,
  LoadingWrap,
  ErrorMessage,
  Footer,
  Grid,
  Section,
  Card,
  Logo,
  Stats,
  StatItem,
  PageButton,
  PageLink,
  HistoryButton,
  SearchSection,
  SearchBar,
  SearchInput,
  SearchButton,
  CategorySelect,
  SortSelect,
  FilterBarLeft,
  FilterCountBar,
  TestCount,

} from '../components/StyledComponents';
import Head from 'next/head';
import Image from 'next/image';
import { FaThumbsUp, FaPlay, FaUserAlt, 
  FaHeart, FaBriefcase, FaGamepad,
   FaBrain, FaUsers, FaEllipsisH,
    FaComment, FaFire, FaStar, FaHandSparkles } from 'react-icons/fa';



const TitleSection = styled.div`
  
  all: unset; /* 기본 스타일 제거 */
  position: relative;
  display: flex;
  width: 100%;
  justifyContent: flex-end;
`;

// 추천 슬라이드 스타일 컴포넌트
const RecommendSection = styled.div`
  margin: 1px auto;
  max-width: 500px;  
  min-width: 320px;
  width:100%;
  aspect-ratio: 5 / 3;
  border-radius: 1px;
  position: relative;
  padding:20px 2vw;
  overflow: hidden;
`;

const Title = styled.h2`
  position: relative;
  font-size: 1rem;
  padding: 10px 2vw;
  justify-items: center;
  width:100%;
  color:rgb(0, 0, 0);
  font-weight: 600;
  justifyContent:flex-start;
  margin:0;
 @font-face {
    font-family: 'omyu_pretty';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2304-01@1.0/omyu_pretty.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
}
`;
const RecommendItemImage = styled.img.attrs({ loading: 'lazy' })`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background: #fff;
  transition: transform 0.3s ease;
  &:hover { transform: scale(1.05); }
`;
const RecommendSlider = styled.div`
  position: relative;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  /* 드래그 이동을 transform으로 처리 (실시간 반영) */
  transform: translateX(${props => props.dragOffsetX}px);
  transition: ${props => (props.isDragging ? 'none' : 'transform 0.5s ease')};

  

`;

const RecommendSlide = styled.div`
  position: relative;
  max-width:500px;
  min-width:320px;
  width: 100%;
  height: 100%;
  display: flex;
  flex: 0 0 100%;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  z-index: ${props => (props.style?.zIndex ? props.style.zIndex : 11)};

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 100%;
    box-shadow: 5px 0px 10px 2px rgba(0, 0, 0, 0.51);
    pointer-events: none;
    z-index: 10;
  }
`;
const RecommendCard = styled.div`
  border-radius: 15px;
  color: white;
  text-align: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: transform 0.3s ease;
  pointer-events: auto;
  
  &:hover {
    transform: scale(1.05);
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 100%;
    box-shadow: 0px 5px 10px 2px rgba(0, 0, 0, 0.51);
    pointer-events: none;
    
  }

`;

const RecommendThumbnailContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RecommendStats = styled.div`
  position: absolute;
  display: flex;
  gap: 1px;
  left: 0px;
  font-size: 0.8rem;
  opacity: 0.8;
  bottom: 0px;
  border-radius: 5px;
  font-weight:600;
  background: rgba(8, 8, 8, 0.9); 
  
`;
//background: rgba(255, 248, 248, 0.9); 
const RecommendStat = styled.span`
  padding: 8px;
  display: flex;
  color :  rgba(255, 255, 255, 0.9); 
  align-items: center;
  gap: 0.5px;
`;
const IconStat = styled.span`
  display: flex;
  color :  rgba(255, 255, 255, 0.9); 
  font-size: 0.7rem;
  align-items: center;
  gap: 0.5px;
`;
const ScrollIconStat = styled.span`
  display: flex;
  color :  rgba(255, 255, 255, 0.9); 
  font-size: 0.6rem;
  align-items: center;
  gap: 0.5px;
`;


const SlidePageText = styled.div`
  position: absolute;
  bottom: 1vw;  
  right : 1vw;
  font-size: 0.9rem;
  font-weight: bold;
  background: rgba(8, 8, 8, 0.78); 
  padding: 5px 10px;
  border-radius: 12px;
  z-index: 50;
  color: #333;
`;

const CurrentPage = styled.span`
  color: #fff; /* 흰색 */
`;

const TotalPages = styled.span`
  color: #aaa; /* 짙은 회색 */
`;
const SlideDots = styled.div`
  position: absolute;
  display: none;
  transform: translateX(-50%);  /* 정중앙 정렬 */
  text-align:center;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
  left: 50%;
  
z-index: 50; /* 카드 위로 올라오도록 */
bottom: 10px;  /* 카드 위에 고정되는 위치 */
`;

const SlideDot = styled.div`
  gap: 5px;
  width: 10px;
  height: 10px;
  border-radius: 40%;
  background: ${props => props.active ? '#6a5acd' : '#d5d0f7'};
  cursor: pointer;
  color: #6a5acd;
  transition: background 0.5s ease;
z-index: 50; /* 카드 위로 올라오도록 */
bottom: 10px;  /* 카드 위에 고정되는 위치 */
`;
const RecommendTitleText = styled.h3`
  font-size: 1.3rem;
  margin: 0 0 1px 0;
  font-weight: 600;
`;

const RecommendDesc = styled.p`
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
`;




const SlideProgressBar = styled.div`
  width: 400px;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin: 20px auto 0 auto;
  overflow: hidden;
`;

const SlideProgress = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(0.45, 0, 0.55, 1);
`;


// 스타일 상수 정의 (공통 사용)
const CONTAINER_WIDTH = '100%';
const CONTAINER_MAXWIDTH = 500;
const CONTAINER_MINWIDTH = 600;
const loadingContainerStyle = {
  width: CONTAINER_WIDTH,
  maxWidth: 500,
  minWidth: 500,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 700
};
// axios 인스턴스 생성
//'http://localhost:4000/api',
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
const backgroundColor = '#fdfdfd';
//const backgroundColor = 'rgb(255, 246, 167)';
// Section 스타일 상수 (backgroundColor 컨테이너 공통)
'rgba(255, 208, 0, 0.1)'




const sectionContainerStyle = {
  //minWidth: 1200,
  margin: '0px auto 0 auto',
  background: backgroundColor,
  borderRadius: 3,
  //boxShadow: '0 6px 32px rgba(80,80,120,0.10)',
  padding: '0 0 10px 0',
  minHeight: 'calc(100vh - 32px)', // 기존보다 더 크게, 화면을 아래까지 채움
  position: 'relative',
  // 모바일 중앙정렬 보정  width: 100vw;
  minWidth: '320px',
  maxWidth: '500px',
  boxSizing: 'border-box',
  boxShadow: 'none'
};



const sectionCenterStyle = {
  ...sectionContainerStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const sectionBlockStyle = {
  ...sectionContainerStyle,
  display: 'block',
};


// 추천 슬라이더 컴포넌트
function RecommendSliderSection({ router, getTestFolderName }) {
  const [recommendTests, setRecommendTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const sliderRef = useRef(null);

  // 추천 테스트 로딩
  useEffect(() => {
    const loadRecommendTests = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/recommends');
        if (response.data && response.data.length > 0) {
          setRecommendTests(response.data);
        }
      } catch (error) {
        console.error('추천 테스트 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendTests();
  }, []);

  // 전역 마우스 이벤트
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => handleDragging(e);
    const handleMouseUp = (e) => handleDragEnd(e);
    const handleTouchMove = (e) => handleDragging(e);
    const handleTouchEnd = (e) => handleDragEnd(e);

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { passive: false });
      document.removeEventListener('mouseup', handleMouseUp, { passive: false });
      document.removeEventListener('touchmove', handleTouchMove, { passive: false });
      document.removeEventListener('touchend', handleTouchEnd, { passive: false });
    };
  }, [isDragging, dragStartX, dragOffsetX]);

  // 자동 슬라이드 타이머
  useEffect(() => {
    if (isHovered || isDragging || isTransitioning || recommendTests.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % recommendTests.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isHovered, isDragging, isTransitioning, recommendTests.length, lastInteractionTime]); // lastInteractionTime 다시 추가

  const handleDragStart = (e) => {
    e.preventDefault();
    const x = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setDragStartX(x);
    setIsDragging(true);
  };

  const handleDragging = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    let offset = x - dragStartX;
    const slideWidth = sliderRef.current ? sliderRef.current.offsetWidth : 0;

    // 드래그 범위 제한 (양 옆 슬라이드까지만)
    if (offset > slideWidth) offset = slideWidth;
    if (offset < -slideWidth) offset = -slideWidth;

    setDragOffsetX(offset);
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const slideWidth = sliderRef.current ? sliderRef.current.offsetWidth : 0;
    const threshold = slideWidth / 4; // 25% 이상 드래그해야 이동

    if (dragOffsetX < -threshold) {
      // 다음 슬라이드로 이동
      setCurrentSlide((prev) => (prev + 1) % recommendTests.length);
    } else if (dragOffsetX > threshold) {
      // 이전 슬라이드로 이동
      setCurrentSlide((prev) => (prev - 1 + recommendTests.length) % recommendTests.length);
    }else if (dragOffsetX === 0) {
      // 테스트로 이동
      handleTestClick(recommendTests[currentSlide]);
    }


    setIsDragging(false);
    setDragOffsetX(0);

    // 드래그 종료 시 hover 상태 초기화 및 타이머 강제 재시작
    setIsHovered(false);
    setLastInteractionTime(Date.now());
  };

  const handleTestClick = (test) => {
    try {
      if (!test.id) {
        console.error('테스트 ID가 없습니다:', test);
        return;
      }
      let testPath = null;
      let stringTemplate = 'template';
      if (/^template\d+$/.test(test.folder)) {
        testPath = `/testview/${stringTemplate + test.id}/`;
      } else {
        testPath = `/testview/${getTestFolderName(test.id)}`;
      }
      console.log('새 슬라이더 테스트 클릭:', testPath, '원본 ID:', test.id);
      router.push(testPath);
    } catch (error) {
      console.error('새 슬라이더 테스트 클릭 에러:', error, '테스트 데이터:', test);
    }
  };

  if (loading) {
    return (
      <>
        <RecommendSection>

          {/* RecommendTitle을 왼쪽 정렬 */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start', // 왼쪽 정렬
              alignItems: 'center',
              padding: '0 10px', // 좌우 여백 (선택사항)
            }}
          >
            <Title>
              <FaThumbsUp style={{ marginRight: '5px', fontSize: '0.9rem' }} />
              추천해요
            </Title>
          </div>
          <RecommendSlider>
            <RecommendSlide active={true}>
              <RecommendCard>
                <RecommendTitleText>추천 테스트를 불러오는 중...</RecommendTitleText>
              </RecommendCard>
            </RecommendSlide>
          </RecommendSlider>
        </RecommendSection>
      </>
    );
  }

  if (recommendTests.length === 0) {
    return null;
  }

  // 무한 루프를 위한 슬라이드 배열 복제
  const infiniteSlides = [...recommendTests, ...recommendTests, ...recommendTests];
  const total = recommendTests.length;

  // 실제 슬라이드 인덱스 (무한 루프용)
  const actualSlideIndex = currentSlide + total;

  return (
    <>
      {/* RecommendTitle을 왼쪽 정렬 */}
      <TitleSection
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'between-space',
        }}
      >
        <Title style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: '0 2vw',
        }}>
          <FaThumbsUp style={{ verticalAlign: 'middle', marginRight: '5px', fontSize: '0.9rem' }} />
          추천해요
        </Title>

        <div style={{
          width: '100%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'flex-end',
          justifyItems: 'center',
        }}>

          <PageLink
            href="/lotto/page"
            style={{
              padding: '0 2vw',
              position: 'relative',
              alignItems: 'center',
            }}
          >Lotto</PageLink>
        </div>
      </TitleSection>
      <RecommendSection
        onMouseEnter={() => !isDragging && setIsHovered(true)}
        onMouseLeave={() => !isDragging && setIsHovered(false)}
      >

        <RecommendSlider
          ref={sliderRef}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              transform: `translateX(calc(-${actualSlideIndex * 100}% + ${dragOffsetX}px))`,
              transition: isDragging ? 'none' : 'transform 0.3s ease',
            }}
          >
            {infiniteSlides.map((test, idx) => (
              <RecommendSlide
                key={`${test?.id || idx}-${Math.floor(idx / total)}`}
                style={{
                  width: '100%',
                  height: '100%',
                  flex: '0 0 100%',
                  position: 'relative',
                }}
              >
                <RecommendCard>
                  <RecommendThumbnailContainer>
                    {test?.thumbnail && (
                      <Image
                        src={getImagePath(test.thumbnail)}
                        alt={test.title}
                        draggable={false}
                        onContextMenu={handleDragStart}
                        onTouchStart={handleDragStart}
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onClick={() => handleTestClick(test)}
                        style={{
                          maxHeight: '100%', maxWidth: '100%', height: 'auto', width: 'auto',
                          objectFit: 'cover'
                        }}
                        layout="responsive"
                        width={120}
                        height={120}
                      />

                    )}

                    <TestItemPlaceholder
                      style={{ display: test?.thumbnail ? 'none' : 'flex', cursor: 'pointer' }}
                      onClick={() => handleTestClick(test)}
                    >
                      <Image src="/uploads/logo.png" alt="심풀 로고"
                        layout="fixed" width={35} height={35} style={{ verticalAlign: 'middle' }} />

                    </TestItemPlaceholder>
                  </RecommendThumbnailContainer>
                  <RecommendStats>
                    <RecommendStat><IconStat><FaPlay style={{ marginRight: '3px' , fontSize: '0.6rem' }}></FaPlay></IconStat>{test?.views}</RecommendStat>
                    <RecommendStat><IconStat><FaHeart style={{ marginRight: '3px' }}></FaHeart></IconStat>{test?.likes}</RecommendStat>
                    <RecommendStat><IconStat><FaComment style={{ marginRight: '3px' }}></FaComment></IconStat>{typeof test?.comments === 'number' ? test.comments : 0}</RecommendStat>
                  </RecommendStats>
                </RecommendCard>
              </RecommendSlide>
            ))}
          </div>
          <SlidePageText>
            <CurrentPage>{currentSlide + 1}</CurrentPage>
            <TotalPages>/{recommendTests.length}</TotalPages>
          </SlidePageText>
        </RecommendSlider>
        {recommendTests.length > 1 && (
          <>
            <SlideDots>
              {recommendTests.map((_, index) => (
                <SlideDot
                  key={index}
                  active={index === currentSlide}
                  onClick={() => {
                    setCurrentSlide(index);
                    setLastInteractionTime(Date.now());
                  }}
                />
              ))}
            </SlideDots>
          </>
        )}
      </RecommendSection>
    </>
  );
}

function ShadowedImage({ src, alt }) {
  const imageContainerRef = useRef(null);
  const [shadowStyle, setShadowStyle] = useState({});

  const handleImageLoad = async (e) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 필요 시
    img.src = e.target.currentSrc; // next/image가 실제 로드한 이미지 경로

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let r = 0,
        g = 0,
        b = 0;
      let count = 0;

      for (let i = 0; i < imageData.length; i += 4 * 100) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }

      const avgR = r / count;
      const avgG = g / count;
      const avgB = b / count;

      const brightness = (avgR * 299 + avgG * 587 + avgB * 114) / 1000;

      if (brightness > 170) {
        setShadowStyle({
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        });
      } else {
        setShadowStyle({ boxShadow: 'none' });
      }
    };
  };

  return (
    <div
      ref={imageContainerRef}
      style={{
        width: '100%',
        maxWidth: 500,
        height: 300,
        position: 'relative',
        ...shadowStyle,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="contain"
        onLoadingComplete={handleImageLoad}
        style={{
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
// 리스트 영역 분리 컴포넌트
function TestListSection({ searching, sortedTests, loadingMore, error, searchTerm, selectedCategory, loadMore, getTestFolderName, router, getImagePath, loading }) {

  // 항상 Section/TestCount 구조 유지, Grid는 리스트 있을 때만
  const showNoResults = !searching && !loading && sortedTests.length === 0 && (searchTerm || selectedCategory);

  // hot/new 계산
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const hotIds = sortedTests
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map(t => t.id);

  return (
    <Section style={sectionBlockStyle}>
      {loading ? (
        <LoadingWrap style={loadingContainerStyle}>
          <span style={{ fontSize: '1.1rem' }}>테스트를 불러오는 중...</span>
        </LoadingWrap>
      ) : searching ? (
        <LoadingWrap style={loadingContainerStyle}>
          <span style={{ fontSize: '1.1rem' }}>검색 중...</span>
        </LoadingWrap>
      ) : showNoResults ? (
        <NoResults>
          <h3>검색 결과가 없습니다</h3>
          <p>다른 검색어나 카테고리를 시도해보세요.</p>
        </NoResults>
      ) : (
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
                    let testPath = null;
                    console.log(test.folder);
                    testPath = `/testview/${getTestFolderName(test.id)}`;
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
                      <Image
                        src={getImagePath(test.thumbnail)}
                        alt={test.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        layout="fill"
                        style={{
                          maxHeight: '100%', maxWidth: '100%',
                          objectFit: 'contain', display: 'block', verticalAlign: 'middle'
                        }}

                      />
                    ) : null}
                    <TestItemPlaceholder style={{ display: test.thumbnail ? 'none' : 'flex', maxHeight: '360px', maxWidth: '100%', }}>
                      <Image src="/uploads/logo.png" alt="심풀 로고"
                        layout="fixed" width={50} height={50} style={{ borderRadius: '10px', verticalAlign: 'middle' }} />

                    </TestItemPlaceholder>

                    {(isNew || isHot) && (
                      <div style={{ position: 'absolute', left: '5px', top: '5px', minHeight: 24 }}>
                        {isNew && <Badge type="new">NEW</Badge>}
                        {isHot && <Badge type="hot">HOT</Badge>}
                      </div>
                    )}
                    <TestItemStats>
                      <Stat><IconStat><FaPlay style={{ marginRight: '3px', fontSize: '0.6rem' }}></FaPlay></IconStat>{test?.views}</Stat>
                      <Stat><IconStat><FaHeart style={{ marginRight: '3px' }}></FaHeart></IconStat>{test?.likes}</Stat>
                      <Stat><IconStat><FaComment style={{ marginRight: '3px' }}></FaComment></IconStat>{typeof test?.comments === 'number' ? test.comments : 0}</Stat>

                    </TestItemStats>
                  </TestThumbnailContainer>
                  <TestContent>
                    <TestItemTitle>
                      {test.title}
                      <TestItemDesc>{test.description}</TestItemDesc>
                    </TestItemTitle>
                  </TestContent>
                </TestCardContent>
              </Card>
            );
          })}
        </Grid>
      )}
      {/**{loadingMore && !loading && !searching && !showNoResults && (
         <LoadingMore>
          <span style={{ color: '#888', fontSize: '1.1rem' }}>더 많은 테스트를 불러오는 중...</span>
        </LoadingMore> <blank></blank>
      )}**/}
    </Section>
  );
}
export function ScrollListSection({ searching, sortedTests, loadingMore, error, searchTerm, selectedCategory, loadMore, getTestFolderName, router, getImagePath, loading }) {

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [wasDragging, setWasDragging] = useState(false);
  const lastClientXRef = useRef(0); // ⭐ 마지막 x 위치 저장
  const scrollRef = useRef(null);
  // hot/new 계산
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const hotIds = sortedTests
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map(t => t.id);

  
  // 전역 마우스 이벤트
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => handleDragging(e);
    const handleMouseUp = (e) => handleDragEnd(e);
    const handleTouchMove = (e) => handleDragging(e);
    const handleTouchEnd = (e) => handleDragEnd(e);

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { passive: false });
      document.removeEventListener('mouseup', handleMouseUp, { passive: false });
      document.removeEventListener('touchmove', handleTouchMove, { passive: false });
      document.removeEventListener('touchend', handleTouchEnd, { passive: false });
    };
  }, [isDragging, dragStartX, dragOffsetX]);

  const handleDragStart = (e) => {
    
    console.log('handleDragStart',e);
    const x = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setDragStartX(x);
    lastClientXRef.current = x; // 초기값 설정
    setIsDragging(true);
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
  };

  const handleDragging = (e) => {
    if (!isDragging || !scrollRef.current) return;
  
  // 모바일에서만 preventDefault
  if (e.type === 'touchmove') {
    e.preventDefault();
  }
  
    console.log('handleDragging',e);
    console.log('scrollRef.current.scrollLeft', scrollRef.current.scrollLeft)
    console.log('scrollWidth:', scrollRef.current.scrollWidth);
    console.log('clientWidth:', scrollRef.current.clientWidth);
    const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const offset = x - lastClientXRef.current;
  
    scrollRef.current.scrollLeft -= offset;
  
    if (Math.abs(offset) > 5) { // 5px 이상 움직이면 드래그로 인식
      setWasDragging(true);
    }
    lastClientXRef.current = x; 
    setDragStartX(x); // ✅ 기준점 업데이트해서 부드럽게 이동
  };

  const handleDragEnd = (e) => {
    console.log('handleDragEnd',e);
    setIsDragging(false);
      
    // 100ms 후 드래그 상태 초기화 (클릭과 시간 겹치지 않도록)
    setTimeout(() => setWasDragging(false), 100);

  };

  return (
    <ScrollSection>
      {(
        <ScrollRow>
          <ScrollInner  ref={scrollRef}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onContextMenu={(e) => e.preventDefault()} 
        >
          {sortedTests.map((test) => {
            const isNew = new Date(test.createdAt).getTime() > weekAgo;
            const isHot = hotIds.includes(test.id);
            return (
              <ScrollCard
                key={test.id}
                onClick={() => {
                  try {
                    if (wasDragging){
                      return; //drag중 클릭 방지
                    }
                    if (!test.id) {
                      console.error('테스트 ID가 없습니다:', test);
                      return;
                    }
                    let testPath = null;
                    console.log(test.folder);
                    testPath = `/testview/${getTestFolderName(test.id)}`;
                    console.log('테스트 클릭:', testPath, '원본 ID:', test.id);
                    router.push(testPath);
                  } catch (error) {
                    console.error('테스트 클릭 에러:', error, '테스트 데이터:', test);
                  }
                }}
              >
                <ScrollTestCardContent>
                  <ScrollThumbnailContainer>
                    {test.thumbnail ? (
                      <Image
                        src={getImagePath(test.thumbnail)}
                        alt={test.title}
                        draggable={false}
                        onContextMenu={handleDragStart}
                        onTouchStart={handleDragStart}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        layout="fill"
                        style={{
                          maxHeight: '100%', maxWidth: '100%',
                          objectFit: 'contain', display: 'block', verticalAlign: 'middle'
                        }}

                      />
                    ) : null}
                    <ScrollTestItemPlaceholder style={{ display: test.thumbnail ? 'none' : 'flex', maxHeight: '360px', maxWidth: '100%', }}>
                      <Image src="/uploads/logo.png" alt="심풀 로고"
                        layout="fixed" width={50} height={50} style={{ borderRadius: '10px', verticalAlign: 'middle' }} />

                    </ScrollTestItemPlaceholder>

                    {(isNew || isHot) && (
                      <ScrollBadges>
                        {isNew && <ScrollBadge type="new">NEW</ScrollBadge>}
                        {isHot && <ScrollBadge type="hot">HOT</ScrollBadge>}
                      </ScrollBadges>
                    )}
                    <ScrollItemStats>
                      <ScrollStat><ScrollIconStat><FaPlay style={{ marginRight: '3px' , fontSize: '0.5rem' }}></FaPlay></ScrollIconStat>{test?.views}</ScrollStat>
                      <ScrollStat><ScrollIconStat><FaHeart style={{ marginRight: '3px' }}></FaHeart></ScrollIconStat>{test?.likes}</ScrollStat>
                    </ScrollItemStats>
                  </ScrollThumbnailContainer>
                  <ScrollContent>
                    <ScrollItemTitle>
                      {test.title}
                    </ScrollItemTitle>
                    <ScrollItemDesc>{test.description}</ScrollItemDesc>
                  </ScrollContent>
                </ScrollTestCardContent>
              </ScrollCard>
            );
          })}

        </ScrollInner></ScrollRow>
      )}
    </ScrollSection>
  );
}
// 이미지 경로를 올바르게 처리하는 함수
export const getImagePath = (path) => {
  if (!path) return null;
  path = `https://smartpick.website${path}`
  return path;
};

// 카테고리별 아이콘 매핑
const categoryIcons = {
  '성격': <FaUserAlt />,
  '연애': <FaHeart />,
  '직업': <FaBriefcase />,
  '취미': <FaGamepad />,
  '지능': <FaBrain />,
  '사회성': <FaUsers />,
  '기타': <FaEllipsisH />,
};

// 카테고리 그리드: 두 줄, 짝수면 반반, 홀수면 윗줄이 하나 더 많게
const getRowCounts = (total) => {
  const top = Math.ceil(total / 2);
  const bottom = Math.floor(total / 2);
  return { top, bottom };
};

function CategoryGrid({ categories, onSelect }) {
  const { top, bottom } = getRowCounts(categories.length);
  const topRow = categories.slice(0, top);
  const bottomRow = categories.slice(top);
  return (
    <div>
      <CategoryBar columns={top}>
        {topRow.map(cat => (
          <CategoryButton key={cat.id} onClick={() => onSelect?.(cat.id)}>
            {categoryIcons[cat.name] || <FaEllipsisH />}
            <span style={{ fontSize: '0.7rem' }}>{cat.name}</span>
          </CategoryButton>
        ))}
      </CategoryBar>
      {bottom > 0 && (
        <CategoryBar columns={bottom}>
          {bottomRow.map(cat => (
            <CategoryButton key={cat.id} onClick={() => onSelect?.(cat.id)}>
              {categoryIcons[cat.name] || <FaEllipsisH />}
              <span style={{ fontSize: '0.7rem' }}>{cat.name}</span>
            </CategoryButton>
          ))}
        </CategoryBar>
      )}
    </div>
  );
}

const CategoryBar = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns}, 1fr)`};
  gap: 18px 24px;
  max-width: 400px;
  margin: 12px auto 12px auto;
  justify-items: center;
`;
const CategoryButton = styled.button`
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border: none;
  border-radius: 18px;
  box-shadow: 0 4px 16px #6a5acd33;
  padding: 18px 0 10px 0;
  min-height: 80px;
  cursor: pointer;
  transition: box-shadow 0.18s, background 0.18s, color 0.18s;
  color: #6a5acd;
  font-weight: 600;
  font-size: 1.05rem;
  outline: none;
  &:hover, &:focus {
    background: #f3f0ff;
    box-shadow: 0 6px 24px #6a5acd55;
    color: #fff;
  }
  & svg {
    font-size: 2.1rem;
    margin-bottom: 6px;
    color: #6a5acd;
    transition: color 0.18s;
  }
  &:hover svg, &:focus svg {
    color:rgb(147, 132, 248);
  }
`;

export default function Home() {
  const [tests, setTests] = useState([]);
  const [offset, setOffset] = useState(0);
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
  const [fixedTests, setFixedTests] = useState([]);
  const router = useRouter();

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
    Promise.all([
      loadVisitorStats(),
      loadCategories()
    ]);
    loadTests();
    loadFixedTests();
    apiClient.post('/visitors', { page: 'index', userAgent: navigator.userAgent });
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
        console.log(categoryObjects);
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
        offset: offset,
        sort: sort,
      });

      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
        console.log('검색 파라미터 추가:', searchTerm.trim());
        params.delete('limit');
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

      if (reset || searchTerm && searchTerm.trim()) {
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

  // 테스트 데이터 로드
  const loadFixedTests = async (reset = false) => {
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
        offset: offset,
        sort: sort,
      });

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

      if (reset || searchTerm && searchTerm.trim()) {
        setFixedTests(validatedTests);
      } else {
        // 중복 제거 로직 추가
        setFixedTests(prev => {
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

    }
  };


  // 더 많은 테스트 로드 (무한 스크롤)
  const loadMore = () => {
    console.log('loadMore');
    if (!loadingMore && hasMore && !loading && !searching && !showNoResults) {
      setLoadingMore(true)
      setPage(prev => prev + 1);
      setOffset(offset + 8);
      console.log('setOffset', offset);
      // 데이터를 다 불러온 후 setLoadingMore(false) 호출
    }
  };

  // 검색 전용 함수 (리스트만 업데이트)
  const searchTests = async () => {
    try {
      console.log('검색 실행:', { searchTerm, selectedCategory, sort });
      setSearching(true);
      setOffset(0);
      const params = new URLSearchParams({
        page: 1,
        limit: 6,
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
      setTests([]);
      setOffset(0);
      setPage(1);
      setHasMore(true);
      setLoading(true);
      loadTests();

    }, 100);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sort]);

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
  const popularTests = [...fixedTests].sort((a, b) => {
    console.log('pop');
    const local_sort = 'views';
    if (local_sort === 'views') return b.views - a.views;
    if (local_sort === 'likes') return b.likes - a.likes;
    if (local_sort === 'popular') return (b.views + b.likes) - (a.views + a.likes);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const latestTests = [...fixedTests].sort((a, b) => {
    console.log('latest');
    const local_sort = 'latest';
    if (local_sort === 'views') return b.views - a.views;
    if (local_sort === 'likes') return b.likes - a.likes;
    if (local_sort === 'popular') return (b.views + b.likes) - (a.views + a.likes);
    if (local_sort === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);//최신
  });

  const showNoResults = !searching && !loading && sortedTests.length === 0 && (searchTerm || selectedCategory);
  // 스크롤 이벤트 리스너
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollY + windowHeight >= docHeight - 10) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading, searching, showNoResults]);


  // 배너 자동 슬라이드
  useEffect(() => {
    if (sortedTests.length > 0) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % Math.min(sortedTests.length, 5));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [sortedTests]);

  // 항상 MainWrap을 최상위로 렌더링하고, 내부에서 상태별로 Section을 분기 처리
  return (
    <>
      <Head style={{ width: '100%', minWidth: '320px', maxWidth: '500px' }}>
        <title>심풀 - 심심풀이에 좋은 심리테스트</title>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-848040041408559"
          crossOrigin="anonymous"
        />
      </Head>
      <MainWrap style={{
        background: 'linear-gradient(135deg, #7f7fd5 1%, #6a5acd 99%)'
      }}>
        <Section style={sectionContainerStyle}>
          {/*
          <div
            style={{
              width: '100vw',
              minWidth: '320px',
              maxWidth: '500px',
              margin: '0 auto auto auto',
              textAlign: 'center',
              minHeight: '90px',
              background: '#fff',
              borderRadius: 12,
              padding: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              zIndex: 10,
              display: 'block',
            }}
          >
          
            <iframe
              src="/kakao-ad.html"
              style={{
                width: '100vw',
                minWidth: '320px',
                maxWidth: '500px',
                height: '90px',
                border: 'none',
                margin: '0 auto',
                display: 'block',
                background: 'transparent',
              }}
              scrolling="no"
              title="카카오광고"
            />
          </div>
          */}
          {/* 헤더 */}
          <Header>
            <Logo
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setPage(1);
                setError(null);
                router.push('/');
              }}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span style={{ marginRight: -10, marginTop: 11 }}>심</span>
              <Image src="/uploads/logo.png" alt="심풀 로고"
                layout="fixed" width={32} height={32} style={{ verticalAlign: 'middle' }} />
              <span style={{ marginLeft: -10, marginTop: 12 }}>풀</span>
            </Logo>

            {/*<HistoryButton onClick={() => router.push('/history')}>
              📋 기록보기
            </HistoryButton>*/}
          </Header>

          {/* 검색 및 필터 섹션 */}
          {/*    <SearchSection>
            <SearchBar>
              <SearchInput
                type="text"
                placeholder="테스트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchButton>🔍</SearchButton>

              
            <Stats>
              {/*<StatItem>👥 Total: {visitorStats.total.toLocaleString()}</StatItem>*/}
          {/*<StatItem>📊 Today: {visitorStats.today.toLocaleString()}</StatItem>*/}
          {/*<StatItem>📈 Week: {visitorStats.week.toLocaleString()}</StatItem>*/}
          {/*           <StatItem style={{ 
                color: apiStatus === 'connected' ? '#4CAF50' : 
                       apiStatus === 'failed' ? '#f44336' : '#ff9800',
                fontWeight: 'bold'
              }}>
               {/* {apiStatus === 'connected' ? '🟢' : 
                 apiStatus === 'failed' ? '🔴' : '🟡'}*/}
          {/*               </StatItem>
            </Stats>
            </SearchBar>
            
            <FilterCountBar>
  <FilterBarLeft>
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
  </FilterBarLeft>
  <TestCount>
    {loading ? '테스트를 불러오는 중...'
      : searching ? '검색 중...'
      : showNoResults ? '검색 결과가 없습니다'
      : `Total : ${sortedTests.length}`}
  </TestCount>
</FilterCountBar> */}{/* 
          </SearchSection> */}

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
                loadFixedTests(true);
                loadVisitorStats();
                loadCategories();
              }}>🔄 다시 시도</button>
            </ErrorMessage>
          )}

          {/* 추천 슬라이드 */}
          <RecommendSliderSection
            router={router}
            getTestFolderName={getTestFolderName}
          />
          {/* 리스트/검색/로딩 영역 */}
          {/*인기 테스트 영역*/}
          {
            <>
            <Title style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
              <FaStar style={{ verticalAlign: 'middle', marginRight: '5px', fontSize: '0.9rem' }} />
              인기 테스트
            </Title>
            {console.log("pop:",popularTests)}
            <ScrollListSection
              searching={searching}              
              sortedTests={popularTests}
              loadingMore={loadingMore}
              error={error}
              loadMore={loadMore}
              getTestFolderName={getTestFolderName}
              router={router}
              getImagePath={getImagePath}
              loading={loading}
            /></>
          }

          {/*최신 테스트 영역*/}
          {
            <>
            <Title style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
              <FaFire  style={{ verticalAlign: 'middle', marginRight: '5px', fontSize: '0.9rem' }} />
              최신 테스트
            </Title>
            {console.log("latests:",latestTests)}
            <ScrollListSection
              searching={searching}              
              sortedTests={latestTests}
              loadingMore={loadingMore}
              error={error}
              loadMore={loadMore}
              getTestFolderName={getTestFolderName}
              router={router}
              getImagePath={getImagePath}
              loading={loading}
            /></>
          }


          {/* 카테고리 버튼 바 */}
          {/*<CategoryGrid categories={categories} onSelect={setSelectedCategory} />*/}
          {/* 푸터 */}
          <Footer>
            <p>© 심풀 - 재미있는 심리테스트 모음</p>
          </Footer>
        </Section>
      </MainWrap>
    </>
  );
}

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



const TestCardContent = styled.div`
  display: flex;
  flex-direction: column;  width: 100vw;
  width: 100vw;
  max-width:500px;
  min-width:320px;
  width: 100%;
  padding: 10px;
  min-height: 120px;
`;

const ScrollSection = styled.div`
  margin: 0px auto 0 auto;
  border-radius: 3;
  box-shadow: 0 6px 32px rgba(80,80,120,0.10);
  padding: 0 0 30px 0;
  position: relative;
  min-width: 320px;
  max-width: 500px;
  width:100%;

  box-sizing: border-box;
  box-shadow: none;
  display:block;
`;
const ScrollRow = styled.div`
  display: flex;
  
  flex-direction: row;
  gap: 12px;
  width:100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 8px 0 0 2vw;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none; /* 모바일에서 스크롤바 감춤 */
  }
`;

const ScrollInner = styled.div`
 display: flex;
  
  flex-direction: row;
  gap: 12px;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  //scroll-behavior: smooth;
  cursor: grab;
  //scroll-snap-type: x mandatory;
  user-select: none; // ✅ 텍스트 선택 방지
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none; /* 모바일에서 스크롤바 감춤 */
  }
`;

const ScrollCard = styled.div`
  flex: 0 0 40%; // 2.5개 보이려면 (200 * 2.5 ≈ 500px)
  height: 280px;
  border: 1px solid #eee;
  border-radius: 3px;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  scroll-snap-align: start;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
`;
const ScrollTestCardContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width:100%;
  min-width:100%;
  width: 100%;
  min-height: 100%;
`;


const ScrollThumbnailContainer = styled.div`
  position: relative;
  margin-bottom: 0;
  width: 100%;
  max-width:100%;
  min-width:100%;
  max-height:70%;
  min-height:70%;
  width: 100%;
  height:100%;
  display: block;
  align-items: center;
  justify-content: center;
  overflow:hidden;
  display: block;
`;

const ScrollContent = styled.div`
  padding:5px 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const ScrollItemTitle = styled.h3`
  font-size: 0.9rem;
  margin: 0 0 0 0;
  line-height: 1.3;
  font-weight: 600;
  text-align: left; /* 자식 내부는 왼쪽 정렬 */
`;
const ScrollItemDesc = styled.p`
  font-size: 0.7rem;
  margin: 5px 0 0 0;
  opacity: 0.8;
  line-height: 1.4;
  flex: 1;
  text-align: left; /* 자식 내부는 왼쪽 정렬 */
`;

const ScrollTestItemPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-width:100%;
  min-width:100%;
  height: 100%;
  background: linear-gradient(45deg, #667eea, #6a5acd);
  border-radius: 3px;
  display: block;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const ScrollStat = styled.span`
  display: flex;
  align-items: center;
  gap: 2px;
  color :  rgba(255, 255, 255, 0.9); 
`;
const ScrollItemStats = styled.div`
  position: absolute;
  
  left: 0px;
  bottom: 0px;
  display: flex;
  gap: 6px;
  font-size: 0.8rem;
  opacity: 0.7;
  width:30px
  font-size: 0.8rem;
  opacity: 0.8;
  padding: 3px 7px 3px 7px;
  border-radius: 2px;
  font-weight:600;
  background: rgba(8, 8, 8, 0.9); 
`;
const ScrollBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 0px;
  color :  rgba(255, 255, 255, 0.9); 
  position : absolute;
  left: 0px;
  max-height:14px;  
`;
// 뱃지 스타일 추가
const ScrollBadge = styled.span`
  display: inline-block;
  padding: 2px 3px;
  border-radius: 1px;
  font-size: 0.6rem;
  font-weight: bold;
  color: #fff;
  background: ${props => props.type === 'hot' ? '#ff5e5e' : props.type === 'new' ? '#ff9500' : '#4CAF50'};
`;
const TestThumbnailContainer = styled.div`
  position: relative;
  margin-bottom: 15px;
  width: 100vw;
  max-width:500px;
  min-width:400px;
  max-height:300px;
  min-height:240px;
  width: 100%;
  height:100%
  display: flex;
  align-items: center;
  justify-content: center;
  overflow:hidden;
`;

const TestItemPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  max-width:500px;
  min-width:320px;
  height: 100%;
  background: linear-gradient(45deg, #667eea, #6a5acd);
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
  margin: 0 0 2px 0;
  opacity: 0.8;
  line-height: 1.4;
  flex: 1;
`;

const Stat = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color :  rgba(255, 255, 255, 0.9); 
`;
const TestItemImage = styled.img.attrs({ loading: 'lazy' })`
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 2px;
  transition: transform 0.3s ease;
  &:hover { transform: scale(1.05); }
`;


const TestContainer = styled.div`
    width: 100vw;
  minWidth: '320px';
  maxWidth: '500px';
  margin: 2rem auto;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 40px rgba(80,80,120,0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TestIframe = styled.iframe`
  
  width: 100vw;
  minWidth: '320px';
  maxWidth: '500px';
  min-height: 800px;
  border: none;
  background: #fff;
  border-radius: 0 0 24px 24px;
  flex: 1;
  display: block;
`;

const TestItemStats = styled.div`
  position: absolute;
  
  left: 0px;
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  opacity: 0.7;
  width:50px
  font-size: 0.8rem;
  opacity: 0.8;
  bottom: 0px;
  padding: 10px 10px 10px 10px;
  border-radius: 2px;
  font-weight:600;
  background: rgba(8, 8, 8, 0.9); 
`;

// 뱃지 스타일 추가
const Badge = styled.span`
  display: inline-block;
  padding: 5px 5px 5px 5px;
  border-radius: 1px;
  font-size: 0.85rem;
  font-weight: bold;
  color: #fff; ;
  background: ${props => props.type === 'hot' ? '#ff5e5e' : props.type === 'new' ? '#ff9500' : '#4CAF50'};
`;
