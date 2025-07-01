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

// 스타일 컴포넌트 추가 및 개선
const TestContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 70vh;
  min-height: 400px;
  margin: 2rem auto 2rem auto;
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  display: flex;
  flex-direction: column;
  @media (max-width: 900px) {
    height: 60vh;
    min-height: 300px;
    margin: 1rem 0;
  }
  @media (max-width: 600px) {
    height: 50vh;
    min-height: 200px;
    border-radius: 8px;
    margin: 0.5rem 0;
  }
`;

const IframeTopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 12px 0 0;
  background: transparent;
  z-index: 2;
`;

const IframeRefreshButton = styled.button`
  padding: 6px 18px;
  border-radius: 8px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;
  &:hover {
    background: #e0e0e0;
  }
`;

const TestIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
  border-radius: 0 0 14px 14px;
  flex: 1;
  @media (max-width: 600px) {
    border-radius: 0 0 8px 8px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.95);
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
        router.replace(`/testview/${normalizedId}`);
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
        window.top.location.href = `/testview/${id}`;
        return false;
      }
    };
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

  const commentCount = comments.length;
  const testUrl = `/tests/${id}/`;

  // iframe 렌더링 부분 개선
  let iframeSection = null;
  if (!checkedBuild && /^test\d+$/.test(id)) {
    iframeSection = (
      <LoadingWrap>
        <LoadingSpinner />
        <p>테스트 앱 상태를 확인 중...</p>
      </LoadingWrap>
    );
  } else if (buildExists) {
    iframeSection = (
      <TestContainer>
        <IframeTopBar>
          <IframeRefreshButton onClick={reloadIframe}>새로고침</IframeRefreshButton>
        </IframeTopBar>
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
          style={{ display: iframeLoaded ? 'block' : 'none' }}
        />
      </TestContainer>
    );
  } else {
    iframeSection = (
      <ErrorMessage>
        <p>아직 빌드된 테스트 앱이 없습니다.</p>
      </ErrorMessage>
    );
  }

  return (
    <MainWrap>
      <Header>
        <BackButton onClick={() => router.push('/')}>← 홈으로</BackButton>
        <Title>{test?.title || '테스트'}</Title>
      </Header>
      {/* 에러 메시지(있을 때만) */}
      {error && (
        <ErrorMessage>
          <p>🚫 {error}</p>
        </ErrorMessage>
      )}
      {iframeSection}
      {/* 테스트 정보 및 소셜 기능 */}
      <Section>
        <InfoCard>
          <Title>{test?.title || '테스트'}</Title>
          <SubTitle>{test?.description || '테스트 설명이 없습니다.'}</SubTitle>
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
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </CommentSection>
      <Footer />
    </MainWrap>
  );
} 