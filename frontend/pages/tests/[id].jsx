import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';

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
    // 기본 이미지로 대체
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
      // 테스트 데이터 새로고침
      loadTestData();
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  // 댓글 좋아요 토글
  const toggleCommentLike = async (commentId) => {
    try {
      await axios.post(`${API_BASE}/comments/${commentId}/like`);
      // 댓글 목록 새로고침
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
      // 결과 계산
      calculateResult(newAnswers);
    }
  };

  // 결과 계산
  const calculateResult = (finalAnswers) => {
    // 간단한 결과 계산 로직 (실제로는 더 복잡할 수 있음)
    const resultIndex = Math.floor(Math.random() * test.results.length);
    setResult(test.results[resultIndex]);
    setShowResult(true);
    setTestCompleted(true);
    
    // 결과를 로컬 스토리지에 저장
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
        // 클립보드에 복사
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
      {/* 헤더 */}
      <Header>
        <BackButton onClick={() => router.push('/psycho_page')}>
          ← 메인으로
        </BackButton>
        <TestTitle>{test.title}</TestTitle>
        <LikeButton onClick={toggleLike} liked={liked}>
          {liked ? '❤️' : '🤍'} {test.likes}
        </LikeButton>
      </Header>

      {/* 에러 메시지 */}
      {error && (
        <ErrorMessage>
          <p>{error}</p>
          <button onClick={loadTestData}>다시 시도</button>
        </ErrorMessage>
      )}

      {/* 테스트 진행 중 */}
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

      {/* 결과 표시 */}
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

      {/* 테스트 정보 */}
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

      {/* 댓글 섹션 */}
      <CommentSection>
        <CommentHeader>
          <CommentTitle>💬 댓글 ({test.commentCount || 0})</CommentTitle>
          <CommentButton onClick={() => setShowCommentForm(!showCommentForm)}>
            {showCommentForm ? '취소' : '댓글 작성'}
          </CommentButton>
        </CommentHeader>

        {/* 댓글 작성 폼 */}
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

        {/* 댓글 목록 */}
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
          
          {/* 더 많은 댓글 로드 */}
          {hasMoreComments && (
            <LoadMoreButton onClick={loadMoreComments} disabled={loadingComments}>
              {loadingComments ? '로딩 중...' : '더 많은 댓글 보기'}
            </LoadMoreButton>
          )}
        </CommentList>
      </CommentSection>

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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const BackButton = styled.button`
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

const TestTitle = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  text-align: center;
  flex: 1;
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

// 에러 메시지
const ErrorMessage = styled.div`
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

const TestSection = styled.div`
  max-width: 800px;
  margin: 0 auto 30px;
`;

const ProgressBar = styled.div`
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  height: 20px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  background: linear-gradient(90deg, #ff6b6b, #ffa500);
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.9rem;
  font-weight: bold;
`;

const QuestionCard = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const QuestionNumber = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffa500;
  margin-bottom: 20px;
`;

const QuestionText = styled.h2`
  font-size: 1.8rem;
  margin: 0 0 30px 0;
  line-height: 1.4;
`;

const AnswerGrid = styled.div`
  display: grid;
  gap: 15px;
`;

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

const ResultSection = styled.div`
  max-width: 800px;
  margin: 0 auto 30px;
`;

const ResultCard = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  text-align: center;
`;

const ResultTitle = styled.h2`
  font-size: 2rem;
  margin: 0 0 20px 0;
  color: #ffa500;
`;

const ResultImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 20px;
  margin: 20px 0;
  object-fit: cover;
`;

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

const ShareButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ffa500);
  border: none;
  color: white;
  padding: 15px 25px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
`;

const SocialShareButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const SocialButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
`;

const RestartButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 15px 25px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
`;

const InfoSection = styled.div`
  max-width: 800px;
  margin: 0 auto 30px;
`;

const InfoCard = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
`;

const InfoTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0 0 20px 0;
`;

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

const CommentSection = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CommentTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0;
`;

const CommentButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
`;

const CommentForm = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
`;

const CommentInput = styled.input`
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

const CommentTextarea = styled.textarea`
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

const CommentSubmitButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ffa500);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CommentItem = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
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

const Footer = styled.footer`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`; 