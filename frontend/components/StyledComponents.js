import styled from 'styled-components';

// 공통 스타일 컴포넌트들
export const MainWrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
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
  padding: 16px 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  width: 100%;
  max-width: 340px;
  min-width: 0;
  margin: 0 8px 24px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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
  max-width: 90vw;
  min-width: 80vw;
  margin: 2rem auto 0 auto;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 32px 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 1200px) {
    max-width: 98vw;
    border-radius: 16px;
    padding: 24px 4px;
  }
  @media (max-width: 600px) {
    max-width: 96vw;
    min-width: 96vw;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    margin: 0.5rem 0 1.5rem 0;
    padding: 8px 0;
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

// 그리드 스타일들
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-content: center;
  width: 100%;
  gap: 2rem 2rem;
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
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 600px) {
    max-width: 100vw;
    padding: 0 2vw;
    margin-bottom: 16px;
  }
`;

export const CommentSection = styled.div`
  max-width: 800px;
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
  max-width: 800px;
  margin: 0 auto 30px;
  padding: 0 20px;
`;

export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0 auto 1rem auto;
  max-width: 400px;
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  background: #fff;
  color: #222;
  border: 2px solid #764ba2;
  border-radius: 12px;
  font-size: 1.1rem;
  padding: 0.8rem 1.2rem;
  &::placeholder {
    color: #888;
    opacity: 1;
  }
`;

export const SearchButton = styled.button`
  width: 40px;
  height: 40px;
  margin-left: 8px;
  background: linear-gradient(45deg, #ff6b6b, #ffa500);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: linear-gradient(45deg, #ffa500, #ff6b6b);
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