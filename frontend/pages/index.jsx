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
  TestCount
} from '../components/StyledComponents';
import Head from 'next/head';

// 추천 슬라이드 스타일 컴포넌트
const RecommendSection = styled.div`
  margin: 5px auto;
  max-width: 1200px;
  width:100%;
  height: 350px;
  background: #fff;
  border-radius: 1px;
  box-shadow: 0 6px 32px rgba(80,80,120,0.10);
  padding: 1px;
  position: relative;
  overflow: hidden;
`;

const RecommendTitle = styled.h2`

  position: relative;
  width: 100%;  
  height: 100%;
  font-size: 1rem;
  margin: 0 0 5px 5px;
  text-align: left;
  color: #333;
  margin: 0 0 5px 10px;
  font-weight: 600;
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
  width: 100%;
  height: 100%;
  display: flex;
  flex: 0 0 100%;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  z-index: ${props => (props.style?.zIndex ? props.style.zIndex : 11)};
`;
const RecommendCard = styled.div`
  border-radius: 15px;
  padding: 2px;
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
  gap: 10px;
  left: 0px;
  font-size: 0.8rem;
  opacity: 0.8;
  bottom: 0px;
  padding: 10px;
  border-radius: 2px;
  font-weight:600;
  background: rgba(255, 248, 248, 0.9); 
`;

const RecommendStat = styled.span`
  display: flex;
  color :  rgba(3, 12, 24, 0.9); 
  align-items: center;
  gap: 0.5px;
`;


const SlidePageText = styled.div`
  position: absolute;
  bottom: 10px;  
  right : 10px;
  font-size: 0.9rem;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
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
  display: flex;
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
  background: ${props => props.active ? '#667eea' : '#ddd'};
  cursor: pointer;
  transition: background 0.5s ease;
z-index: 50; /* 카드 위로 올라오도록 */
bottom: 10px;  /* 카드 위에 고정되는 위치 */
`;
const RecommendTitleText = styled.h3`
  font-size: 1.3rem;
  margin: 0 0 5px 0;
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
  minHeight: 300
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

// Section 스타일 상수 (흰색 컨테이너 공통)
const sectionContainerStyle = {
  
  //minWidth: 1200,
  margin: '15px auto 0 auto',
  background: '#fff',
  borderRadius: 3,
  boxShadow: '0 6px 32px rgba(80,80,120,0.10)',
  padding: '0 0 32px 0',
  minHeight: 'calc(100vh - 32px)', // 기존보다 더 크게, 화면을 아래까지 채움
  position: 'relative',
  // 모바일 중앙정렬 보정
  width: '500px',
  maxWidth: '500px',
  boxSizing: 'border-box',
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

// 추천 슬라이드 컴포넌트
function RecommendSliderSection({ router, getTestFolderName }) {
  const [recommendTests, setRecommendTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isHovered, setIsHovered] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [pendingSlide, setPendingSlide] = useState(null); // 'next' | 'prev' | null
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now()); // 자동 슬라이드 타이머 초기화용

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e) => handleDragging(e);
    const handleMouseUp = (e) => handleDragEnd(e);
    const handleTouchMove = (e) => handleDragging(e);
    const handleTouchEnd = (e) => handleDragEnd(e);

    // 전역 이벤트 리스너 추가
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStartX, dragOffsetX]);

  const handleDragStart = (e) => {
    e.preventDefault(); // 기본 동작 방지
    const x = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setDragStartX(x);
    setIsDragging(true);
    setLastInteractionTime(Date.now()); // 드래그 시작 시 타이머 초기화
  };

  const sliderRef = useRef(null);
  const handleDragging = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // 기본 동작 방지
    const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    let offset = x - dragStartX;
    const slideWidth = sliderRef.current ? sliderRef.current.offsetWidth : 0;
    // clamp
    if (offset > slideWidth) offset = slideWidth;
    if (offset < -slideWidth) offset = -slideWidth;
    setDragOffsetX(offset);
  };
  
  const handleDragEnd = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // 기본 동작 방지
    
    const slideWidth = sliderRef.current ? sliderRef.current.offsetWidth : 0;
    const threshold = slideWidth / 4;
    
    if (dragOffsetX < -threshold) {
      // 다음 슬라이드로 이동
      setPendingSlide('next');
      setIsTransitioning(true);
      setDragOffsetX(-slideWidth);
    } else if (dragOffsetX > threshold) {
      // 이전 슬라이드로 이동
      setPendingSlide('prev');
      setIsTransitioning(true);
      setDragOffsetX(slideWidth);
    } else {
      // 원래 위치로 복귀
      setPendingSlide(null);
      setIsTransitioning(true);
      setDragOffsetX(0);
    }
    
    setIsDragging(false);
    setLastInteractionTime(Date.now()); // 드래그 종료 시 타이머 초기화
  };

  const handleTransitionEnd = () => {
    if (pendingSlide === 'next') {
      setCurrentSlide((prev) => (prev + 1) % recommendTests.length);
    } else if (pendingSlide === 'prev') {
      setCurrentSlide((prev) => (prev - 1 + recommendTests.length) % recommendTests.length);
    }
    setPendingSlide(null);
    setIsTransitioning(false);
    setDragOffsetX(0);
  };

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

  useEffect(() => {
    if (isHovered || isDragging || isTransitioning) return;
    
    const timer = setInterval(() => {
      setPendingSlide('next');
      setIsTransitioning(true);
      if (sliderRef.current) {
        setDragOffsetX(-sliderRef.current.offsetWidth);
      }
    }, 3000);
    
    return () => clearInterval(timer);
  }, [isHovered, isDragging, isTransitioning, recommendTests.length, lastInteractionTime]); // lastInteractionTime 추가

  const handleSlideClick = (index) => {
    setCurrentSlide(index);
    setLastInteractionTime(Date.now()); // 클릭 시 타이머 초기화
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
      console.log('추천 테스트 클릭:', testPath, '원본 ID:', test.id);
      router.push(testPath);
    } catch (error) {
      console.error('추천 테스트 클릭 에러:', error, '테스트 데이터:', test);
    }
  };

  if (loading) {
        return (
          <>
      <RecommendTitle>고민하기에 시간은 아까워!</RecommendTitle>
          <RecommendSection>
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

  // 캐러셀용 인덱스 계산 (recommendTests 3개 미만 예외처리)
  const total = recommendTests.length;
  
  // 애니메이션 중에는 currentSlide를 고정, 완료 후에만 업데이트
  const displaySlide = isTransitioning ? currentSlide : currentSlide;
  const prevIndex = (displaySlide - 1 + total) % total;
  const nextIndex = (displaySlide + 1) % total;
  
  const visibleSlides = [
    recommendTests[prevIndex],
    recommendTests[displaySlide],
    recommendTests[nextIndex],
  ];
// 트랙 transform
let baseTranslate = -100;
if (pendingSlide === 'next') baseTranslate = -100;
if (pendingSlide === 'prev') baseTranslate = -100;
  return (
    <>
<RecommendTitle>추천해요</RecommendTitle>
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
            transform: `translateX(calc(${baseTranslate}% + ${dragOffsetX}px))`,
            transition: isDragging || !isTransitioning ? 'none' : 'transform 0.5s cubic-bezier(.4,0,.2,1)',
          }}
          
        onTransitionEnd={handleTransitionEnd}
        >
          {visibleSlides.map((test, idx) => (
            <RecommendSlide
              key={test?.id || idx}
              style={{
                width: '100%',
                height: '100%',
                flex: '0 0 100%',
                position: 'relative',
                zIndex: idx === 1 ? 12 : 11,
              }}
            >
              <RecommendCard>
                <RecommendThumbnailContainer>
                  {test?.thumbnail && (
                    <RecommendItemImage
                      src={getImagePath(test.thumbnail)}
                      alt={test.title}
                      draggable={false}
                      onContextMenu={e => e.preventDefault()}
                      onTouchStart={e => e.preventDefault()}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      onClick={() => handleTestClick(test)}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  <TestItemPlaceholder 
                    style={{ display: test?.thumbnail ? 'none' : 'flex', cursor: 'pointer' }}
                    onClick={() => handleTestClick(test)}
                  >
                    🧠
                  </TestItemPlaceholder>
                  <RecommendStats>
                    <RecommendStat>👁️ {test?.views}</RecommendStat>
                    <RecommendStat>💖 {test?.likes}</RecommendStat>
                    <RecommendStat>💬 {typeof test?.comments === 'number' ? test.comments : 0}</RecommendStat>
                  </RecommendStats>
                </RecommendThumbnailContainer>
              </RecommendCard>
            </RecommendSlide>
          ))}
        </div>
      </RecommendSlider>
      {recommendTests.length > 1 && (
  <>
        <SlidePageText>
          <CurrentPage>{currentSlide + 1}</CurrentPage>          
          <TotalPages>/{recommendTests.length}</TotalPages>
        </SlidePageText>
        <SlideDots>
          {recommendTests.map((_, index) => (
            <SlideDot
              key={index}
              active={index === currentSlide}
              onClick={() => handleSlideClick(index)}
            />
          ))}
        </SlideDots>
        </>          
      )}
    </RecommendSection>
    </>
  );
}

// 새로운 슬라이더 컴포넌트
function NewSliderSection({ router, getTestFolderName }) {
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

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
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
    const threshold = slideWidth / 3; // 33% 이상 드래그해야 이동
    
    if (dragOffsetX < -threshold) {
      // 다음 슬라이드로 이동
      setCurrentSlide((prev) => (prev + 1) % recommendTests.length);
    } else if (dragOffsetX > threshold) {
      // 이전 슬라이드로 이동
      setCurrentSlide((prev) => (prev - 1 + recommendTests.length) % recommendTests.length);
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
        <RecommendTitle>새로운 슬라이더</RecommendTitle>
        <RecommendSection>
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
      <RecommendTitle>새로운 슬라이더</RecommendTitle>
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
                      <RecommendItemImage
                        src={getImagePath(test.thumbnail)}
                        alt={test.title}
                        draggable={false}
                        onContextMenu={e => e.preventDefault()}
                        onTouchStart={e => e.preventDefault()}
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onClick={() => handleTestClick(test)}
                        style={{ cursor: 'pointer' }}
                      />
                    )}
                    <TestItemPlaceholder 
                      style={{ display: test?.thumbnail ? 'none' : 'flex', cursor: 'pointer' }}
                      onClick={() => handleTestClick(test)}
                    >
                      🧠
                    </TestItemPlaceholder>
                    <RecommendStats>
                      <RecommendStat>👁️ {test?.views}</RecommendStat>
                      <RecommendStat>💖 {test?.likes}</RecommendStat>
                      <RecommendStat>💬 {typeof test?.comments === 'number' ? test.comments : 0}</RecommendStat>
                    </RecommendStats>
                  </RecommendThumbnailContainer>
                </RecommendCard>
              </RecommendSlide>
            ))}
          </div>
        </RecommendSlider>
        {recommendTests.length > 1 && (
          <>
            <SlidePageText>
              <CurrentPage>{currentSlide + 1}</CurrentPage>          
              <TotalPages>/{recommendTests.length}</TotalPages>
            </SlidePageText>
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
          <span style={{ color: '#888', fontSize: '1.1rem' }}>테스트를 불러오는 중...</span>
        </LoadingWrap>
      ) : searching ? (
        <LoadingWrap style={loadingContainerStyle}>
          <span style={{ color: '#888', fontSize: '1.1rem' }}>검색 중...</span>
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
                    let stringTemplate = 'template'
                    if(/^template\d+$/.test(test.folder))
                     {
                      testPath = `/testview/${stringTemplate+test.id}/`;
                     }
                    else testPath = `/testview/${getTestFolderName(test.id)}`;
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
                    
                    {(isNew || isHot) && (
                      <div style={{position:'absolute', left: '5px',top:'5px', minHeight: 24 }}>
                        {isNew && <Badge type="new">NEW</Badge>}
                        {isHot && <Badge type="hot">HOT</Badge>}
                      </div>
                    )}
                    <TestItemStats>
                      <Stat>👁️ {test.views}</Stat>
                      <Stat>💖 {test.likes}</Stat>
                      <Stat>💬 {typeof test.comments === 'number' ? test.comments : 0}</Stat>
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
// 이미지 경로를 올바르게 처리하는 함수
const getImagePath = (path) => {
  if (!path) return null;
  return path;
};
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
        offset:offset,
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


  
  
  // 더 많은 테스트 로드 (무한 스크롤)
  const loadMore = () => {
      console.log('loadMore');
    if (!loadingMore && hasMore && !loading && !searching && !showNoResults ) {
      setLoadingMore(true)
      setPage(prev => prev + 1);
      setOffset(offset+8);
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
      <Head>
        <title>씸풀 - 심심풀이에 좋은 심리테스트</title>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-848040041408559"
          crossOrigin="anonymous"
        />  
      </Head>
      <MainWrap style={{minHeight: '100vh', background: 'linear-gradient(135deg, #7f7fd5 0%, #86a8e7 100%)' }}>
        <Section style={sectionContainerStyle}>
          <div
          style={{
            width: '100%',
            minWidth: 320,
            maxWidth: 728,
            margin: '0 auto auto auto',
            textAlign: 'center',
            minHeight: 90,
            background: '#fff',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            zIndex: 10,
            display: 'block',
          }}
        >
          <iframe
            src="/kakao-ad.html"
            style={{
              width: '100%',
              minWidth: 320,
              maxWidth: 728,
              height: 90,
              border: 'none',
              margin: '0 auto',
              display: 'block',
              background: 'transparent',
            }}
            scrolling="no"
            title="카카오광고"
          />
        </div>
          {/* 헤더 */}
          <Header>
            <Logo onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setPage(1);
              setError(null);
              router.push('/');
            }} style={{ cursor: 'pointer' }}>🧠씸풀</Logo>
              

            <PageLink href="/lotto/page" >
              로또 번호<br></br>생성기
            </PageLink>

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
                loadVisitorStats();
                loadCategories();
              }}>🔄 다시 시도</button>
            </ErrorMessage>
          )}

          {/* 추천 슬라이드 */}
         {/* <RecommendSliderSection 
            router={router}
            getTestFolderName={getTestFolderName}
          />
         */}

          {/* 새로운 슬라이더 */}
          <NewSliderSection 
            router={router}
            getTestFolderName={getTestFolderName}
          />

          {/* 리스트/검색/로딩 영역 */}
          {
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
              loading={loading}
            />
          }

          {/* 푸터 */}
          <Footer>
            <p>© Smartpick.website - 재미있는 심리테스트 모음</p>
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
  flex-direction: column;
  max-width:500px;
  width: 100%;
  height: 100%;
`;


const TestThumbnailContainer = styled.div`
  position: relative;
  margin-bottom: 15px;
  padding: 5px 5px 5px 5px;
  max-width:500px;
  width: 100%;
  height:100%
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TestItemPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  margin: 0 0 2px 0;
  opacity: 0.8;
  line-height: 1.4;
  flex: 1;
`;

const Stat = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
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
  width: 100%;
  max-width: 500px;
  min-width: 500px;
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
  min-width: 500px;
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
  background: rgba(255, 248, 248, 0.9); 
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
