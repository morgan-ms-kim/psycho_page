import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import {
  MainWrap,
  Header,
  BackButton,
  LoadingWrap,
  LoadingSpinner,
  ErrorMessage,
  Footer,
  PrimaryButton,
  SecondaryButton,
  SocialButton,
  QuestionCard,
  ResultCard,
  InfoCard,
  CommentForm,
  CommentItem,
  Input,
  Textarea,
  Grid,
  FlexRow,
  Section,
  CommentSection,
  Title,
  SubTitle,
  SectionTitle,
  Image,
  ProgressBar,
  ProgressFill,
  ProgressText
} from '../../components/StyledComponents';

// API 기본 URL - nginx 리버스 프록시 사용
const API_BASE = '/api';

export default function TestDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ nickname: '', content: '' });
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);

  // 이미지 로드 실패 처리
  const handleImageError = (e) => {
    if (e.target.src.includes('result.png')) {
      e.target.src = '/default-result.png';
    } else {
      e.target.style.display = 'none';
    }
  };

  // 테스트 데이터 로드
  useEffect(() => {
    if (id) {
      loadTestData();
      loadComments();
      recordVisit();
    }
  }, [id]);

  // 방문 기록
  const recordVisit = async () => {
    try {
      await axios.post(`${API_BASE}/visitors`, {
        testId: id
      });
    } catch (error) {
      console.error('방문 기록 실패:', error);
    }
  };

  // 테스트 데이터 로드
  const loadTestData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tests/${id}`);
      setTest(response.data);
      setLiked(response.data.userLiked || false);
      setLoading(false);
    } catch (error) {
      console.error('테스트 데이터 로드 실패:', error);
      setError('테스트를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  // 댓글 로드
  const loadComments = async (page = 1) => {
    try {
      setLoadingComments(true);
      const response = await axios.get(`${API_BASE}/tests/${id}/comments?page=${page}&limit=10`);
      
      if (page === 1) {
        setComments(response.data.comments);
      } else {
        setComments(prev => [...prev, ...response.data.comments]);
      }
      
      setHasMoreComments(response.data.currentPage < response.data.pages);
      setCommentPage(response.data.currentPage);
      setLoadingComments(false);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
      setLoadingComments(false);
    }
  };

  // 더 많은 댓글 로드
  const loadMoreComments = () => {
    if (!loadingComments && hasMoreComments) {
      loadComments(commentPage + 1);
    }
  };

  // 좋아요 토글
  const toggleLike = async () => {
    try {
      const response = await axios.post(`${API_BASE}/tests/${id}/like`);
      setLiked(response.data.liked);
      loadTestData();
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  // 댓글 좋아요 토글
  const toggleCommentLike = async (commentId) => {
    try {
      await axios.post(`${API_BASE}/comments/${commentId}/like`);
      loadComments(1);
    } catch (error) {
      console.error('댓글 좋아요 처리 실패:', error);
    }
  };

  // 댓글 작성
  const submitComment = async () => {
    if (!newComment.nickname || !newComment.content) return;
    
    try {
      await axios.post(`${API_BASE}/tests/${id}/comments`, newComment);
      setNewComment({ nickname: '', content: '' });
      setShowCommentForm(false);
      loadComments(1);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  // 답변 선택
  const selectAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  // 결과 계산
  const calculateResult = (finalAnswers) => {
    const resultIndex = Math.floor(Math.random() * test.results.length);
    setResult(test.results[resultIndex]);
    setShowResult(true);
    setTestCompleted(true);
    
    const testResult = {
      testId: id,
      testTitle: test.title,
      result: test.results[resultIndex],
      completedAt: new Date().toISOString()
    };
    
    const savedResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    savedResults.push(testResult);
    localStorage.setItem('testResults', JSON.stringify(savedResults));
  };

  // 테스트 다시 시작
  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setResult(null);
    setTestCompleted(false);
  };

  // 결과 공유
  const shareResult = async () => {
    const shareData = {
      title: `${test.title} - ${result.title}`,
      text: `${test.title} 테스트 결과: ${result.title}\n${result.description}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert('결과가 클립보드에 복사되었습니다!');
      }
    } catch (error) {
      console.error('공유 실패:', error);
    }
  };

  // 소셜 미디어 공유
  const shareToSocial = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${test.title} - ${result.title}`);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'kakao':
        shareUrl = `https://story.kakao.com/share?url=${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <LoadingWrap>
        <LoadingSpinner />
        <p>테스트를 불러오는 중...</p>
      </LoadingWrap>
    );
  }

  if (!test) {
    return (
      <ErrorWrap>
        <h2>테스트를 찾을 수 없습니다</h2>
        <button onClick={() => router.push('/psycho_page')}>메인으로 돌아가기</button>
      </ErrorWrap>
    );
  }

  return (
    <MainWrap>
      <Header>
        <BackButton onClick={() => router.push('/psycho_page')}>
          ← 메인으로
        </BackButton>
        <TestTitle>{test.title}</TestTitle>
        <LikeButton onClick={toggleLike} liked={liked}>
          {liked ? '❤️' : '🤍'} {test.likes}
        </LikeButton>
      </Header>

      {error && (
        <ErrorMessage>
          <p>{error}</p>
          <button onClick={loadTestData}>다시 시도</button>
        </ErrorMessage>
      )}

      {!showResult && (
        <TestSection>
          <ProgressBar>
            <ProgressFill progress={(currentQuestion / test.questions.length) * 100} />
            <ProgressText>{currentQuestion + 1} / {test.questions.length}</ProgressText>
          </ProgressBar>

          <QuestionCard>
            <QuestionNumber>Q{currentQuestion + 1}</QuestionNumber>
            <QuestionText>{test.questions[currentQuestion].question}</QuestionText>
            
            <AnswerGrid>
              {test.questions[currentQuestion].answers.map((answer, index) => (
                <AnswerButton
                  key={index}
                  onClick={() => selectAnswer(index)}
                >
                  {answer}
                </AnswerButton>
              ))}
            </AnswerGrid>
          </QuestionCard>
        </TestSection>
      )}

      {showResult && result && (
        <ResultSection>
          <ResultCard>
            <ResultTitle>{result.title}</ResultTitle>
            <ResultImage src={result.image || '/default-result.png'} alt={result.title} onError={handleImageError} />
            <ResultDescription>{result.description}</ResultDescription>
            
            <ShareSection>
              <ShareButton onClick={shareResult}>
                📤 결과 공유하기
              </ShareButton>
              <SocialShareButtons>
                <SocialButton onClick={() => shareToSocial('twitter')}>
                  🐦 트위터
                </SocialButton>
                <SocialButton onClick={() => shareToSocial('facebook')}>
                  📘 페이스북
                </SocialButton>
                <SocialButton onClick={() => shareToSocial('kakao')}>
                  💬 카카오톡
                </SocialButton>
              </SocialShareButtons>
              <RestartButton onClick={restartTest}>
                🔄 다시 테스트하기
              </RestartButton>
            </ShareSection>
          </ResultCard>
        </ResultSection>
      )}

      <InfoSection>
        <InfoCard>
          <InfoTitle>📊 테스트 정보</InfoTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>조회수</InfoLabel>
              <InfoValue>{test.views.toLocaleString()}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>좋아요</InfoLabel>
              <InfoValue>{test.likes.toLocaleString()}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>댓글</InfoLabel>
              <InfoValue>{test.commentCount || 0}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>생성일</InfoLabel>
              <InfoValue>{new Date(test.createdAt).toLocaleDateString()}</InfoValue>
            </InfoItem>
          </InfoGrid>
        </InfoCard>
      </InfoSection>

      <CommentSection>
        <CommentHeader>
          <CommentTitle>💬 댓글 ({test.commentCount || 0})</CommentTitle>
          <CommentButton onClick={() => setShowCommentForm(!showCommentForm)}>
            {showCommentForm ? '취소' : '댓글 작성'}
          </CommentButton>
        </CommentHeader>

        {showCommentForm && (
          <CommentForm>
            <CommentInput
              type="text"
              placeholder="닉네임"
              value={newComment.nickname}
              onChange={(e) => setNewComment({...newComment, nickname: e.target.value})}
              maxLength={20}
            />
            <CommentTextarea
              placeholder="댓글을 작성해주세요..."
              value={newComment.content}
              onChange={(e) => setNewComment({...newComment, content: e.target.value})}
              maxLength={500}
            />
            <CommentSubmitButton onClick={submitComment}>
              댓글 작성
            </CommentSubmitButton>
          </CommentForm>
        )}

        <CommentList>
          {comments.map(comment => (
            <CommentItem key={comment.id}>
              <CommentHeader>
                <CommentAuthor>{comment.nickname}</CommentAuthor>
                <CommentDate>{new Date(comment.createdAt).toLocaleDateString()}</CommentDate>
              </CommentHeader>
              <CommentContent>{comment.content}</CommentContent>
              <CommentActions>
                <CommentLikeButton onClick={() => toggleCommentLike(comment.id)}>
                  👍 좋아요
                </CommentLikeButton>
              </CommentActions>
            </CommentItem>
          ))}
          
          {hasMoreComments && (
            <LoadMoreButton onClick={loadMoreComments} disabled={loadingComments}>
              {loadingComments ? '로딩 중...' : '더 많은 댓글 보기'}
            </LoadMoreButton>
          )}
        </CommentList>
      </CommentSection>

      <Footer>
        <p>© 2024 PSYCHO - 재미있는 심리테스트 모음</p>
      </Footer>
    </MainWrap>
  );
}

// 스타일 컴포넌트들
const TestTitle = styled(Title)``;

const ErrorWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  
  h2 {
    margin-bottom: 1rem;
  }
  
  button {
    background: linear-gradient(45deg, #ff6b6b, #ffa500);
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
  }
`;

const LikeButton = styled.button`
  background: ${props => props.liked ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: ${props => props.liked ? 'rgba(255, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const TestSection = styled(Section)``;

const QuestionNumber = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffa500;
  margin-bottom: 20px;
`;

const QuestionText = styled(SubTitle)``;

const AnswerGrid = styled(Grid)``;

const AnswerButton = styled.button`
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.3);
  color: white;
  padding: 20px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255,255,255,0.2);
    border-color: rgba(255,255,255,0.5);
    transform: translateY(-2px);
  }
`;

const ResultSection = styled(Section)``;

const ResultTitle = styled.h2`
  font-size: 2rem;
  margin: 0 0 20px 0;
  color: #ffa500;
`;

const ResultImage = styled(Image)``;

const ResultDescription = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 20px 0;
`;

const ShareSection = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
`;

const ShareButton = styled(PrimaryButton)``;

const SocialShareButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const RestartButton = styled(SecondaryButton)``;

const InfoSection = styled(Section)``;

const InfoTitle = styled(SectionTitle)``;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  opacity: 0.6;
`;

const InfoValue = styled.span`
  font-size: 1rem;
`;

const CommentHeader = styled(FlexRow)`
  margin-bottom: 20px;
`;

const CommentTitle = styled(SectionTitle)``;

const CommentButton = styled(SecondaryButton)`
  padding: 10px 20px;
`;

const CommentInput = styled(Input)``;

const CommentTextarea = styled(Textarea)``;

const CommentSubmitButton = styled(PrimaryButton)`
  padding: 10px 20px;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CommentAuthor = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const CommentDate = styled.div`
  font-size: 0.8rem;
  opacity: 0.6;
  margin-bottom: 10px;
`;

const CommentContent = styled.div`
  line-height: 1.5;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 10px;
`;

const CommentLikeButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
`;

const LoadMoreButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  ${props => props.disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`; 