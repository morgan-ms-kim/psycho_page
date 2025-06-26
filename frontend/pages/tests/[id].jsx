import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';

// API 기본 URL
const API_BASE = '/psycho-api';

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

  // 테스트 데이터 로드
  useEffect(() => {
    if (id) {
      loadTestData();
      loadComments();
    }
  }, [id]);

  // 테스트 데이터 로드
  const loadTestData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tests/${id}`);
      setTest(response.data);
      setLoading(false);
    } catch (error) {
      console.error('테스트 데이터 로드 실패:', error);
      setLoading(false);
    }
  };

  // 댓글 로드
  const loadComments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tests/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
    }
  };

  // 좋아요 토글
  const toggleLike = async () => {
    try {
      const response = await axios.post(`${API_BASE}/tests/${id}/like`, {
        ip: 'client-ip' // 실제로는 서버에서 IP를 가져와야 함
      });
      setLiked(response.data.liked);
      // 테스트 데이터 새로고침
      loadTestData();
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  // 댓글 작성
  const submitComment = async () => {
    if (!newComment.nickname || !newComment.content) return;
    
    try {
      await axios.post(`${API_BASE}/tests/${id}/comments`, newComment);
      setNewComment({ nickname: '', content: '' });
      setShowCommentForm(false);
      loadComments();
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
  };

  // 테스트 다시 시작
  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setResult(null);
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
        <button onClick={() => router.push('/psycho')}>메인으로 돌아가기</button>
      </ErrorWrap>
    );
  }

  return (
    <MainWrap>
      {/* 헤더 */}
      <Header>
        <BackButton onClick={() => router.push('/psycho')}>
          ← 메인으로
        </BackButton>
        <TestTitle>{test.title}</TestTitle>
        <LikeButton onClick={toggleLike} liked={liked}>
          {liked ? '❤️' : '🤍'} {test.likes}
        </LikeButton>
      </Header>

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
            <ResultImage src={result.image || '/default-result.png'} alt={result.title} />
            <ResultDescription>{result.description}</ResultDescription>
            
            <ShareSection>
              <ShareButton onClick={() => navigator.share?.({ title: test.title, text: result.title })}>
                📤 결과 공유하기
              </ShareButton>
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
          <InfoStats>
            <StatItem>👁 조회수: {test.views.toLocaleString()}</StatItem>
            <StatItem>❤️ 좋아요: {test.likes.toLocaleString()}</StatItem>
            <StatItem>💬 댓글: {comments.length}개</StatItem>
            <StatItem>📅 생성일: {new Date(test.createdAt).toLocaleDateString()}</StatItem>
          </InfoStats>
        </InfoCard>
      </InfoSection>

      {/* 댓글 섹션 */}
      <CommentSection>
        <CommentHeader>
          <CommentTitle>💬 댓글 ({comments.length})</CommentTitle>
          <AddCommentButton onClick={() => setShowCommentForm(true)}>
            댓글 작성
          </AddCommentButton>
        </CommentHeader>

        {showCommentForm && (
          <CommentForm>
            <FormInput
              placeholder="닉네임"
              value={newComment.nickname}
              onChange={e => setNewComment({...newComment, nickname: e.target.value})}
            />
            <FormTextarea
              placeholder="댓글을 작성해주세요..."
              value={newComment.content}
              onChange={e => setNewComment({...newComment, content: e.target.value})}
            />
            <FormButtons>
              <CancelButton onClick={() => setShowCommentForm(false)}>
                취소
              </CancelButton>
              <SubmitButton onClick={submitComment}>
                작성
              </SubmitButton>
            </FormButtons>
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
            </CommentItem>
          ))}
        </CommentList>
      </CommentSection>
    </MainWrap>
  );
}

// 스타일 컴포넌트들
const MainWrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
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

const ErrorWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  button {
    margin-top: 20px;
    padding: 10px 20px;
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    border-radius: 10px;
    cursor: pointer;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const BackButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
`;

const TestTitle = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  text-align: center;
  flex: 1;
`;

const LikeButton = styled.button`
  background: ${props => props.liked ? 'rgba(255,105,180,0.3)' : 'rgba(255,255,255,0.2)'};
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
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

const InfoStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const StatItem = styled.div`
  font-size: 1rem;
  opacity: 0.9;
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

const AddCommentButton = styled.button`
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

const FormInput = styled.input`
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

const FormTextarea = styled.textarea`
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

const FormButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
`;

const SubmitButton = styled.button`
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