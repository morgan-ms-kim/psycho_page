import styled, {keyframes} from 'styled-components';

// 공통 스타일 컴포넌트들

// 흔들리는 애니메이션 정의
export const wiggle = keyframes`
   0% {
    transform: rotate(0deg);
    color: #333;
    text-shadow: none;
  }
  10% {
    transform: rotate(1deg);
    color: #6a5acd;
    text-shadow: 0 0 1px rgb(0, 0, 0);
  }
  20% {
    transform: rotate(-1deg);
    color: #6a5acd;
    text-shadow: 0 0 1px rgb(0, 0, 0);
  }
  30% {
    transform: rotate(1deg);
    color:rgb(40, 34, 77);
    text-shadow: 0 0 1px rgb(255, 255, 255);
  }
  40% {
    transform: rotate(-1deg);
    color: #6a5acd;
    text-shadow: 0 0 1px rgb(0, 0, 0);
  }
  50% {
    transform: rotate(0deg);
    color:rgb(55, 43, 131);
    text-shadow: 0 0 1px rgb(0, 0, 0);
  }
  60% {
    transform: rotate(0deg);
    color: #6a5acd;
    text-shadow: 0 0 1px rgb(0, 0, 0);
  }

  100% {
    transform: rotate(0deg);
    color:rgb(0, 0, 0);
    text-shadow: 0 3px 7px rgba(39, 37, 37, 0.5);
  }
`;


export const MainWrap = styled.div`
  width: 100vw;
  minWidth: 320px;
  maxWidth: 500px;
  min-height: 100vh;

  background: linear-gradient(135deg, #6a5acd 0%, #6a5acd 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;

   @media (max-width: 1200px) {
    max-width: 500px;
    min-width: 320px;
    border-radius: 1px;
    
  }
  @media (max-width: 600px) {
    max-width: 500px;
    min-width: 320x;
    border-radius: 1px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    
    
  }


`;

export const Header = styled.header`
  position: relative;
  display: flex;
  padding: 25px 16px;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-width: 320px;
  max-width: 500px;
  box-sizing: border-box;
  margin: 10 auto;
  background:rgb(255, 255, 255);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

export const BackButton = styled.button`
  background: #fff;
  color: #764ba2;
  border: 2px solid #764ba2;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(80,80,120,0.08);
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #ede7f6;
    color: #5a3e8b;
  }
`;

export const LoadingWrap = styled.div`
  display: flex;
  max-width: 1200px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #ffffff;
  color: white;
  @media (max-width: 600px) {
    max-width: 96vw;
    min-width: 96vw;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    margin: 0.5rem 0 1.5rem 0;
    padding: 8px 0;
  }
`;

export const LoadingSpinner = styled.div`
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

export const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background: rgba(255, 0, 0, 0.1);
  margin: 1rem 2rem;
  border-radius: 10px;
  
  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    background: #ff6b6b;
    color: white;
    cursor: pointer;
  }
`;

export const Footer = styled.footer`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

// 버튼 스타일들
export const PrimaryButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ffa500);
  border: none;
  color: white;
  padding: 15px 25px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  
  &:hover {
    opacity: 0.9;
  }
`;
export const PageLink = styled.a`
  all: unset; /* 버튼 기본 스타일 제거 */
  cursor: pointer;
  font-size: 2rem;
  color: #333;
  position: absolute;
  top:0;
  transition: text-shadow 0.3s ease;
  font-weight: bold;
  font-family: 'GangwonEduHyeonokT_OTFMediumA';
  /* 가끔씩 자동으로 흔들리는 효과 */
  animation: ${wiggle} 3s ease-in-out infinite;
  animation-delay: 5s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  animation-fill-mode: forwards;
  animation-direction: alternate;
  animation-play-state: running;

  &:hover {
    text-shadow: 0 3px 7px rgba(39, 37, 37, 0.5);
    color: #333;
    font-size: 2.1rem;
    outline: none;
  }
  &:focus {
    outline: none;
    
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    animation-play-state: paused; /* 호버 중엔 흔들리지 않음 */
  }
@font-face {
    font-family: 'GangwonEduHyeonokT_OTFMediumA';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/GangwonEduHyeonokT_OTFMediumA.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
  @font-face {
    font-family: 'WarhavenB';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2312-1@1.1/WarhavenB.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
}
    @font-face {
    font-family: 'ghanachoco';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_20-04@1.0/ghanachoco.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
`;

export const PageButton = styled.button`
  all: unset; /* 버튼 기본 스타일 제거 */
  cursor: pointer;
  font-size: 1.1rem;
  color: #333;
  position: relative;
  transition: text-shadow 0.3s ease;

  /* 가끔씩 자동으로 흔들리는 효과 */
  animation: ${wiggle} 1s ease-in-out infinite;
  animation-delay: 5s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  animation-fill-mode: forwards;
  animation-direction: alternate;
  animation-play-state: running;

  &:hover {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    color: #333;
    background: #fff;
    font-size: 1.1rem;
    outline: none;
  }
  &:focus {
    outline: none;
    
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    animation-play-state: paused; /* 호버 중엔 흔들리지 않음 */
  }
`;

export const SecondaryButton = styled.button`
  background: rgba(3, 3, 3, 0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 15px 25px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

export const SocialButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;


// 그리드 스타일들
export const Grid = styled.div`
   display: grid;
  grid-template-columns: 1fr;
  justify-content: center;
  justify-items: center;
  width: 100vw;
  max-width:500px;
  min-width:320px;
  
  min-height: 120px;
  margin: 0 auto;
  grid-row-gap: 5px;

  background: rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 500px;
    gap: 2px;
    padding: 0 2vw;
  }
`;

// 카드 스타일들
export const Card = styled.div`
   background: rgba(255,255,255,0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.18);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  width: 100vw;
  max-width:500px;
  min-width:320px;
  min-height: 120px;  
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.28);
  }
  @media (max-width: 900px) {
    margin: 0 0 14px 0;
  }
  @media (max-width: 600px) {
  max-width: 100vw;
  max-width: 100vw;
    margin: 0 0 10px 0
  }
`;

export const QuestionCard = styled(Card)`
  padding: 40px;
  border-radius: 20px;
`;

export const ResultCard = styled(Card)`
  padding: 40px;
  border-radius: 20px;
  text-align: center;
`;

export const InfoCard = styled(Card)`
  max-width: 500px;
  min-width: 500px;
  margin: 0.2rem auto 0 auto;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 8px 10px 8px 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: auto;
  flex: none;

  @media (max-width: 1200px) {
    max-width: 95vw;
    border-radius: 8px;
    padding: 8px 6px;
  }
  @media (max-width: 600px) {
    max-width: 98vw;
    min-width: 0;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    margin: 0.1rem auto 0.5rem auto;
    padding: 6px 2px;
  }
`;

export const CommentForm = styled(Card)`
  margin-bottom: 20px;
`;

export const CommentItem = styled(Card)`
  padding: 20px;
`;

// 입력 필드 스타일들
export const Input = styled.input`
  width: 100%;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 1rem;
  
  &::placeholder {
    color: rgba(255,255,255,0.6);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &::placeholder {
    color: rgba(255,255,255,0.6);
  }
`;




export const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

// 섹션 스타일들
export const Section = styled.div`
  width: 100vw;
  minWidth: 320px;
  maxWidth: 500px;

  margin: 10px;
  padding: 0 2px 0 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 600px) {
  max-width: 100vw;
  max-width: 100vw;
    padding: 0 2vw;
    margin-bottom: 16px;
  }
`;

export const CommentSection = styled.div`
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 타이틀 스타일들
export const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  text-align: center;
  flex: 1;
`;

export const SubTitle = styled.h2`
  font-size: 1.8rem;
  margin: 0 0 30px 0;
  line-height: 1.4;
`;

export const SectionTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0 0 20px 0;
`;

// 이미지 스타일들
export const Image = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 20px;
  margin: 20px 0;
  object-fit: cover;
`;

// 진행바 스타일들
export const ProgressBar = styled.div`
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  height: 20px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  background: linear-gradient(90deg, #ff6b6b, #ffa500);
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

export const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.9rem;
  font-weight: bold;
`;

// 메인 페이지 전용 스타일 컴포넌트들


export const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 200;
  color: #6a5acd;
  text-align:center;
  font-family: 'kdg_Medium', sans-serif;
  @font-face {
    font-family: 'kdg_Medium';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts-20-12@1.0/kdg_Medium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
@font-face {
    font-family: 'GongGothicMedium';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_20-10@1.0/GongGothicMedium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
  @font-face {
    font-family: 'BagelFatOne-Regular';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_JAMO@1.0/BagelFatOne-Regular.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
}
  @font-face {
  font-family: 'UhBeeHyeki';
  src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_five@.2.0/UhBeeHyeki.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

@font-face {
    font-family: 'PFStardustExtraBold';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/2506-1@1.0/PFStardustExtraBold.woff2') format('woff2');
    font-weight: 800;
    font-style: normal;
}
@font-face {
    font-family: 'SF_HambakSnow';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2106@1.1/SF_HambakSnow.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

`;


export const Stats = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  @media (max-width: 768px) {
    gap: 10px;
    font-size: 0.92rem;
    overflow-x: auto;
    white-space: nowrap;
    width: 100%;
    padding-bottom: 2px;
    -webkit-overflow-scrolling: touch;
  }
`;
export const StatItem = styled.span`
  font-size: 0.9rem;
  min-width: 70px;
  color: #4a4a4a;  
  font-weight: 600;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  opacity: 0.9;
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0 2px;
  }
`;


export const HistoryButton = styled(SecondaryButton)`
  font-size: 0.9rem;
  padding: 10px 15px;
  background: #7f7fd5 !important;
  color: #fff !important;
  border: none;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(127,127,213,0.08);
  &:hover {
    background: #b3aaff !important;
    color: #222 !important;
  }
`;

export const SearchSection = styled.div`
  width: 100%;
  max-width: 800px;
  min-width: 0;
  margin: 0 auto 00px;
  padding: 0 8px;
  box-sizing: border-box;
  @media (max-width: 600px) {
    max-width: 100vw;
    padding: 0 2vw;
    margin-bottom: 16px;
  }
`;

export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
  min-width: 0;
  margin: 0 auto 1rem auto;
  box-sizing: border-box;
  flex-direction: row;
  gap: 8px;
  @media (max-width: 600px) {
    max-width: 100vw;
    padding: 0 2vw;
    gap: 4px;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 320px;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  color: #222;
  border: 2px solid #764ba2;
  border-radius: 12px;
  font-size: 1.1rem;
  padding: 0.8rem 1.2rem;
  @media (max-width: 600px) {
    font-size: 1rem;
    padding: 0.7rem 1rem;
  }
  &::placeholder {
    color: #888;
    opacity: 1;
  }
`;
export const KakaoAdContainer = styled.div`
  width: 100%;
  max-width: 728px;
  min-width: 728px;
  min-height: 90px;
  margin: 0 auto;
  text-align: center;
  background: transparent;
  box-sizing: border-box;
  padding: 24px 0 0 0;
  @media (max-width: 600px) {
    max-width: 320px;
    min-width: 320px;
    minheight: 100px;
    padding: 16px 0 0 0;
  }
`;

export const SearchButton = styled.button`
  width: 40px;
  height: 50px;
  min-width: 40px;
  margin-left: 1px;
  background: linear-gradient(45deg, #7f7fd5, #b3aaff);
  border: none;
  border-radius: 20%;
  color: #fff;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  @media (max-width: 600px) {
    width: 36px;
    height: 36px;
    min-width: 36px;
    font-size: 1.1rem;
    margin-left: 6px;
  }
  &:hover {
  
    background: linear-gradient(90deg, #b3aaff, #7f7fd5);
  }
`;
export const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 18px 0 18px 0;
  gap: 12px;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin: 10px 0 10px 0;
  }
`;
// 필터/카운트 바: 좌우 정렬 및 바깥쪽 여백
export const FilterCountBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 18px 0 0 0;
  gap: 12px;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin: 10px 0 10px 0;
  }
`;

// 왼쪽: 카테고리/정렬
export const FilterBarLeft = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

// 오른쪽: 테스트 카운트
export const TestCount = styled.div`
  text-align: right;
  font-size: 1.2rem;
  font-weight: 600;
  color: #4a4a4a;
  opacity: 0.8;
  min-width: 100px;
  letter-spacing: 0.02em;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  margin-left: 16px;
`;

// 완전 커스텀 셀렉트 스타일 (항상 동일하게 보이도록)
const baseSelectStyle = `
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background: rgba(255,255,255,0.2);
  border: 1.5px solid #764ba2;
  color: #222;
  padding: 0.7rem 2.2rem 0.7rem 1rem;
  border-radius: 20px;
  font-size: 1rem;
  font-family: inherit;
  font-weight: 500;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  box-shadow: none;
  cursor: pointer;
  min-width: 120px;
  background-image: url("data:image/svg+xml;utf8,<svg fill='gray' height='20' viewBox='0 0 20 20' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7.293 7.293a1 1 0 011.414 0L10 8.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 1.2em;
  &:focus {
    border: 2px solid #ff6b6b;
    background: #fff;
    color: #222;
  }
  &::-ms-expand {
    display: none;
  }
`;

export const CategorySelect = styled.select`
  ${baseSelectStyle}
  background-color: #fffbe7;
  color: #222;
  option {
    background: #fffbe7;
    color: #222;
    font-size: 1rem;
  }
`;

export const SortSelect = styled.select`
  ${baseSelectStyle}
  background-color: #fff;
  color: #222;
  option {
    background: #fff;
    color: #222;
    font-size: 1rem;
  }
`;

export const BannerStats = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0,0,0,0.7);
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
`;

// 통계용 라벨/값
export const StatLabel = styled.span`
  display: block;
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 2px;
`;

export const StatValue = styled.span`
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
`;

// TestItemStats는 프론트엔드 페이지에서 정의하므로 여기서는 제거 

// 댓글 섹션 스타일 컴포넌트
export const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const CommentTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
`;

export const CommentButton = styled.button`
  background: #ffe066;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #ffb3e6;
    color: #222;
  }
`;

export const CommentFormContainer = styled.div`
  background: #fffbe7;
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
`;

export const CommentInput = styled.input`
  width: 100%;
  padding: 0.7rem;
  margin-bottom: 0.7rem;
  border: 1px solid #ffe066;
  border-radius: 8px;
  font-size: 1rem;
  @media (max-width: 600px) {
    font-size: 1rem;
    padding: 0.6rem;
  }
`;

export const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 0.7rem;
  margin-bottom: 0.7rem;
  border: 1px solid #ffe066;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 80px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  @media (max-width: 600px) {
    font-size: 1rem;
    padding: 0.6rem;
    min-height: 60px;
  }
`;

export const CommentSubmitButton = styled.button`
  background: #ff5e5e;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #ffb3e6;
    color: #222;
  }
  @media (max-width: 600px) {
    font-size: 1rem;
    padding: 0.6rem 1.2rem;
  }
`;

export const ButtonWrapper = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  position: relative;
  width: 40px;
  height: 40px;
  box-shadow : none;
  
  &:hover {
    background:rgba(122, 77, 228, 0.58);
    scale:1.2;
    color: #222;
  }
`;


export const HeartWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  
  align-items: center;
  justify-content: center;
`;

export const RedCircle = styled.div`
width: 30px;
height: 30px;
border-radius: 50%;
position: absolute;
border: 1px solid #ff4d4d;
top: 50%;
left: 50%;
  transform: translate(-50%, -50%);
`;

export const Bubble = styled.div`
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #ff4d4d;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
