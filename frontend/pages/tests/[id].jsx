import { useState, useEffect, useRef } from 'react';
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

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'https://smartpick.website/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 테스트 ID를 폴더명으로 변환하는 함수
const getTestIdFromFolder = (folderName) => {
  if (folderName.startsWith('test')) {
    return folderName.replace('test', '');
  }
  return folderName;
};

// 실제로 빌드된 index.html이 있는지 체크하는 함수(간단히 경로 패턴으로)
const isValidTestUrl = (id) => {
  return /^test\d+$/.test(id);
};

export default function TestPage() {
  const router = useRouter();
  const { id } = router.query;
  
  // URL 경로 정규화 - 중복 test 제거
  useEffect(() => {
    if (id && typeof id === 'string') {
      // testtest1 -> test1로 정규화
      if (id.startsWith('testtest')) {
        const normalizedId = id.replace('testtest', 'test');
        console.log('URL 정규화:', id, '->', normalizedId);
        router.replace(`/tests/${normalizedId}`);
        return;
      }
    }
  }, [id, router]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [test, setTest] = useState(null);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState({ nickname: '', content: '', password: '' });
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [buildExists, setBuildExists] = useState(false);
  const [checkedBuild, setCheckedBuild] = useState(false);
  const iframeRef = useRef(); // iframe 제어용 ref 추가

  // 테스트 데이터 로드
  useEffect(() => {
    if (id) {
      loadTestData();
      recordVisit();
    }
  }, [id]);

  useEffect(() => {
    if (/^test\d+$/.test(id)) {
      fetch(`/tests/${id}/index.html`, { method: 'HEAD' })
        .then(res => {
          setBuildExists(res.ok);
          setCheckedBuild(true);
        })
        .catch(() => {
          setBuildExists(false);
          setCheckedBuild(true);
        });
    } else {
      setBuildExists(false);
      setCheckedBuild(true);
    }
  }, [id]);

  const recordVisit = async () => {
    try {
      const testId = getTestIdFromFolder(id);
      await apiClient.post(`/visitors`, {
        testId: testId
      });
    } catch (error) {
      console.error('방문 기록 실패:', error);
    }
  };

  const loadTestData = async () => {
    try {
      // iframe 내부에서 실행 중인지 확인
      if (window.self !== window.top) {
        console.log('iframe 내부에서 실행 중 - 테스트 데이터 API 호출 건너뜀');
        setLoading(false);
        return;
      }

      const testId = getTestIdFromFolder(id);
      const response = await apiClient.get(`/tests/${testId}`);
      setTest(response.data);
      setLiked(response.data.userLiked || false);
      setLoading(false);
    } catch (error) {
      console.error('테스트 데이터 로드 실패:', error);
      setError('테스트를 불러오는데 실패했습니다. 서버 연결을 확인해주세요.');
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const testId = getTestIdFromFolder(id);
      const response = await apiClient.post(`/tests/${testId}/like`);
      setLiked(response.data.liked);
      setTest(prev => ({
        ...prev,
        likes: response.data.liked ? prev.likes + 1 : prev.likes - 1
      }));
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  const loadComments = async () => {
    try {
      const testId = getTestIdFromFolder(id);
      const response = await apiClient.get(`/tests/${testId}/comments`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
    }
  };

  const submitComment = async () => {
    if (!newComment.nickname || !newComment.content || !newComment.password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    
    try {
      const testId = getTestIdFromFolder(id);
      await apiClient.post(`/tests/${testId}/comments`, newComment);
      setNewComment({ nickname: '', content: '', password: '' });
      setShowCommentForm(false);
      loadComments();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    };
    
  const handleIframeError = () => {
    setError('테스트 앱을 로드하는데 실패했습니다.');
    setLoading(false);
  };

  useEffect(() => {
    if (test) {
      loadComments();
    }
  }, [test]);

  // iframe 새로고침 방지 및 제어
  useEffect(() => {
    const preventRefresh = (e) => {
      // iframe 내부에서 새로고침 시도 시
      if (window.self !== window.top) {
        e.preventDefault();
        e.stopPropagation();
        
        // iframe 내부에서 상위 페이지로 리다이렉트
        window.top.location.href = `/tests/${id}`;
        return false;
      }
    };

    // 새로고침 이벤트 리스너 추가
    window.addEventListener('beforeunload', preventRefresh);
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        preventRefresh(e);
      }
    });

    return () => {
      window.removeEventListener('beforeunload', preventRefresh);
    };
  }, [id]);

  // 새로고침 버튼 핸들러
  const reloadIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.location.reload();
    }
  };

  if (loading) {
    return (
      <MainWrap>
        <Header>
          <BackButton onClick={() => router.push('/')}>← 홈으로</BackButton>
        </Header>
      <LoadingWrap>
        <LoadingSpinner />
        <p>테스트를 불러오는 중...</p>
      </LoadingWrap>
      </MainWrap>
    );
  }

  if (error) {
    return (
      <MainWrap>
        <Header>
          <BackButton onClick={() => router.push('/')}>← 홈으로</BackButton>
        </Header>
        <ErrorMessage>
          <p>🚫 {error}</p>
          <button onClick={() => router.push('/')}>홈으로 돌아가기</button>
        </ErrorMessage>
      </MainWrap>
    );
  }

  // 중복 렌더링 방지: test 데이터가 없거나 title이 비정상(예: github url)일 때 렌더링 X
  if (!test || !test.title || test.title.startsWith('http')) {
    return (
      <MainWrap>
        <Header>
          <BackButton onClick={() => router.push('/')}>← 홈으로</BackButton>
        </Header>
        <ErrorMessage>
          <p>🚫 올바른 테스트 정보가 없습니다.</p>
        </ErrorMessage>
      </MainWrap>
    );
  }

  const commentCount = comments.length;

  // iframe URL 설정 - 간단하게
  const testUrl = `/tests/${id}/`;

  if (!checkedBuild && /^test\d+$/.test(id)) {
    return (
      <MainWrap>
        <Header>
          <BackButton onClick={() => router.push('/')}>← 홈으로</BackButton>
        </Header>
        <LoadingWrap>
          <LoadingSpinner />
          <p>테스트 앱 상태를 확인 중...</p>
        </LoadingWrap>
      </MainWrap>
    );
  }

  return (
    <MainWrap>
      <Header>
        <BackButton onClick={() => router.push('/')}>← 홈으로</BackButton>
        <TestTitle>{test?.title || '테스트'}</TestTitle>
      </Header>

      {/* 빌드된 테스트만 iframe으로 띄움 */}
      {buildExists ? (
        <TestContainer>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 0 0' }}>
            <button onClick={reloadIframe} style={{ padding: '6px 16px', borderRadius: 5, background: '#eee', border: 'none', cursor: 'pointer' }}>
              새로고침
            </button>
          </div>
          {!iframeLoaded && (
            <LoadingOverlay>
              <LoadingSpinner />
              <p>테스트 앱을 로드하는 중...</p>
            </LoadingOverlay>
          )}
          <TestIframe
            ref={iframeRef}
            src={testUrl}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={test?.title || '테스트'}
            allow="fullscreen"
            sandbox="allow-scripts allow-forms allow-popups"
          />
        </TestContainer>
      ) : (
        <ErrorMessage>
          <p>아직 빌드된 테스트 앱이 없습니다.</p>
        </ErrorMessage>
      )}

      {/* 테스트 정보 및 소셜 기능 */}
      <Section>
        <InfoCard>
          <Title>{test?.title}</Title>
          <SubTitle>{test?.description}</SubTitle>
            
          <FlexRow>
            <SocialButton onClick={handleLike} liked={liked}>
              {liked ? '💖 좋아요 취소' : '🤍 좋아요'}
                </SocialButton>
            <SocialButton onClick={() => setShowCommentForm(!showCommentForm)}>
              💬 댓글 작성
                </SocialButton>
          </FlexRow>
          
          <Grid>
            <StatItem>
              <StatLabel>조회수</StatLabel>
              <StatValue>{test?.views || 0}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>좋아요</StatLabel>
              <StatValue>{test?.likes || 0}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>댓글</StatLabel>
              <StatValue>{commentCount}</StatValue>
            </StatItem>
          </Grid>
        </InfoCard>
      </Section>

      {/* 댓글 섹션 */}
      <CommentSection>
        <CommentHeader>
          <CommentTitle>💬 댓글 ({commentCount})</CommentTitle>
          <CommentButton onClick={() => setShowCommentForm(!showCommentForm)}>
            {showCommentForm ? '취소' : '댓글 작성'}
          </CommentButton>
        </CommentHeader>

        {showCommentForm && (
          <CommentFormContainer>
            <CommentInput
              type="text"
              placeholder="닉네임"
              value={newComment.nickname}
              onChange={(e) => setNewComment({...newComment, nickname: e.target.value})}
              maxLength={20}
            />
            <CommentInput
              type="password"
              placeholder="비밀번호 (4자 이상)"
              value={newComment.password}
              onChange={(e) => setNewComment({...newComment, password: e.target.value})}
              minLength={4}
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
          </CommentFormContainer>
        )}

        {comments.map((comment) => (
            <CommentItem key={comment.id}>
            <CommentItemHeader>
                <CommentAuthor>{comment.nickname}</CommentAuthor>
                <CommentDate>{new Date(comment.createdAt).toLocaleDateString()}</CommentDate>
            </CommentItemHeader>
              <CommentContent>{comment.content}</CommentContent>
            </CommentItem>
          ))}
          
        {comments.length === 0 && (
          <EmptyComment>
            <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
          </EmptyComment>
        )}
      </CommentSection>

      <Footer>
        <p>© 2025 PSYCHO - 재미있는 심리테스트 모음</p>
        <div id="kakao-ad-container"></div>
      </Footer>


    </MainWrap>
  );
}

// 페이지 전용 스타일 컴포넌트들
const TestTitle = styled.h1`
  font-size: 1.5rem;
  color: white;
  margin: 0;
  flex: 1;
  text-align: center;
`;

const TestContainer = styled.div`
  position: relative;
  width: 100%;
  height: 80vh;
  min-height: 600px;
  margin-bottom: 2rem;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const TestIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  p {
    margin-top: 1rem;
    font-size: 1.1rem;
    color: #333;
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
    font-weight: bold;
  color: #667eea;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CommentTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0;
`;

const CommentButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #5a6fd8;
  }
`;

const CommentFormContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
`;

const CommentInput = styled(Input)`
  margin-bottom: 1rem;
`;

const CommentTextarea = styled(Textarea)`
  margin-bottom: 1rem;
  min-height: 100px;
`;

const CommentSubmitButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #5a6fd8;
  }
`;

const CommentItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CommentAuthor = styled.div`
  font-weight: bold;
  color: #667eea;
`;

const CommentDate = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
`;

const CommentContent = styled.div`
  margin-top: 0.5rem;
  line-height: 1.5;
`;

const EmptyComment = styled.div`
  text-align: center;
  padding: 2rem;
  opacity: 0.7;
  
  p {
    margin: 0;
  }
`; 