import styled from 'styled-components';

// 공통 스타일 컴포넌트들
export const MainWrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

export const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  margin-bottom: 80px; /* 광고를 위한 여백 줄임 */
  
  @media (max-width: 727px) {
    margin-bottom: 100px; /* 모바일에서는 더 큰 여백 */
  }
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

export const SecondaryButton = styled.button`
  background: rgba(255,255,255,0.2);
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

// 카드 스타일들
export const Card = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
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
  border-radius: 15px;
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

// 그리드 스타일들
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 0 15px;
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
  max-width: 800px;
  margin: 0 auto 30px;
`;

export const CommentSection = styled.div`
  max-width: 800px;
  margin: 0 auto;
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
export const Logo = styled.h1`
  font-size: 2rem;
  margin: 0;
  background: linear-gradient(45deg, #ff6b6b, #ffa500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const Stats = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

export const StatItem = styled.span`
  font-size: 0.9rem;
  opacity: 0.9;
`;

export const HistoryButton = styled(SecondaryButton)`
  font-size: 0.9rem;
  padding: 10px 15px;
`;

export const SearchSection = styled.div`
  max-width: 800px;
  margin: 0 auto 30px;
  padding: 0 20px;
`;

export const SearchBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: rgba(255,255,255,0.1);
  border-radius: 25px;
  padding: 5px;
  backdrop-filter: blur(10px);
`;

export const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 12px 20px;
  font-size: 1rem;
  
  &::placeholder {
    color: rgba(255,255,255,0.6);
  }
  
  &:focus {
    outline: none;
  }
`;

export const SearchButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ffa500);
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

export const FilterBar = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

export const CategorySelect = styled.select`
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  
  option {
    background: #333;
    color: white;
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

// TestItemStats는 프론트엔드 페이지에서 정의하므로 여기서는 제거 