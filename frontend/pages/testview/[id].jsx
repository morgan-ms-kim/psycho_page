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
  ProgressBar,
  ProgressFill,
  ProgressText,
  SocialButton,
  StatItem,
  StatLabel,
  StatValue,
  CommentHeader,
  CommentTitle,
  CommentButton,
  CommentFormContainer,
  CommentInput,
  CommentTextarea,
  CommentSubmitButton
} from '../../components/StyledComponents';
import Image from 'next/image';
import Head from 'next/head';

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
  max-width: 1200px;
  min-width: 1000px;
  height: auto;
  max-height: 2000px;
  min-height: 1000px;
  margin: 2rem auto 2rem auto;
  margin-bottom: 3rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  display: flex;
  flex-direction: column;
  @media (max-width: 1800px) {
    max-width: 100%;
    min-height: 800px;
    margin: 1rem 0 3rem 0;
  }
  @media (max-width: 600px) {
    min-height: 200px;
    border-radius: 12px;
    margin: 0.5rem 0 3rem 0;
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
  min-height: 600px;
  height: auto;
  max-height: none;
  border: none;
  background: #fff;
  border-radius: 0 0 24px 24px;
  flex: 1;
  @media (max-width: 600px) {
    border-radius: 0 0 12px 12px;
    min-height: 200px;
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

// 댓글 렌더링용 컴포넌트
function RenderedCommentItem({ comment }) {
  if (!comment) return null;
  return (
    <CommentItem style={{ marginBottom: 16, background: '#fff', color: '#222', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontWeight: 600, color: '#6c63ff', fontSize: '1rem', marginRight: 8 }}>
          {comment.nickname || '익명'}
        </span>
        <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
          {comment.createdAt ? new Date(comment.createdAt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' }) : ''}
        </span>
      </div>
      <div style={{ fontSize: '1.08rem', whiteSpace: 'pre-line', wordBreak: 'break-all', marginBottom: 2 }}>
        {comment.content}
      </div>
    </CommentItem>
  );
}

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

  useEffect(() => {
    // 광고 컨테이너가 없으면 광고 로드 시도
    if (!document.getElementById('kakao-ad-container')) {
      if (typeof window !== 'undefined') {
        // _app.jsx의 loadKakaoAd와 동일한 방식으로 광고 로드
        const loadKakaoAd = () => {
          try {
            const isPC = window.matchMedia('(min-width: 728px)').matches;
            const adUnit = isPC ? 'DAN-NOAbzxQGMUQ8Mke7' : 'DAN-gNGXA6EnAXz8usSK';
            const adWidth = isPC ? '728' : '320';
            const adHeight = isPC ? '90' : '100';
            let container = document.getElementById('kakao-ad-container');
            if (!container) {
              container = document.createElement('div');
              container.id = 'kakao-ad-container';
              container.style.cssText = `position: relative; margin-top: 1rem; text-align: center; min-height: ${adHeight}px;`;
              document.body.prepend(container);
            }
            container.innerHTML = '';
            const adElement = document.createElement('ins');
            adElement.className = 'kakao_ad_area kakao-ad-fixed';
            adElement.style.display = 'none';
            adElement.setAttribute('data-ad-unit', adUnit);
            adElement.setAttribute('data-ad-width', adWidth);
            adElement.setAttribute('data-ad-height', adHeight);
            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.src = '//t1.daumcdn.net/kas/static/ba.min.js';
            scriptElement.async = true;
            container.appendChild(adElement);
            container.appendChild(scriptElement);
          } catch (e) { console.error(e); }
        };
        loadKakaoAd();
      }
    }
  }, []);

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
    <>
      <Head>
        <title>{test?.title ? `${test.title} - PSYCHO` : '테스트 상세 - PSYCHO'}</title>
      </Head>
      <MainWrap style={{ paddingTop: 0, background: 'linear-gradient(135deg, #7f7fd5 0%, #86a8e7 100%)' }}>
        <Section style={{
          maxWidth: 1400,
          margin: '40px auto 0 auto',
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 8px 40px rgba(80,80,120,0.12)',
          padding: '0 0 48px 0',
          minHeight: 120,
          position: 'relative'
        }}>
          <div id="kakao-ad-container"
            style={{
              width: '100%',
              minHeight: 60,
              textAlign: 'center',
              background: 'transparent',
              margin: 0,
              padding: '24px 0 0 0'
            }}
          />
          <Header style={{ marginBottom: 0, padding: '0.5rem 2rem 0.5rem 2rem', background: 'rgba(255,255,255,0.05)' }}>
            <BackButton onClick={() => router.push('/')}>← 홈으로</BackButton>
          </Header>
          {/* 에러 메시지(있을 때만) */}
          {error && (
            <ErrorMessage>
              <p>🚫 {error}</p>
            </ErrorMessage>
          )}
          {/* 테스트 앱(iframe) */}
          {iframeSection}
          {/* 제목/설명 카드: iframe 아래로 이동, 여백 최소화 */}
          <InfoCard style={{
            maxWidth: 1200,
            margin: '40px auto 0 auto',
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(80,80,120,0.10)',
            padding: '40px 32px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <Title style={{ color: '#222', fontSize: '1.3rem', marginBottom: 4 }}>{test?.title || '테스트'}</Title>
              <SubTitle style={{ color: '#555', fontSize: '1rem', marginBottom: 8 }}>{test?.description || '테스트 설명이 없습니다.'}</SubTitle>
              <div style={{ display: 'flex', gap: 24, margin: '8px 0', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <StatLabel style={{ color: '#888', fontSize: '0.95rem' }}>조회수</StatLabel>
                  <StatValue style={{ color: '#222', fontSize: '1.1rem' }}>{test?.views || 0}</StatValue>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <StatLabel style={{ color: '#888', fontSize: '0.95rem' }}>좋아요</StatLabel>
                  <StatValue style={{ color: '#ff5e5e', fontSize: '1.1rem' }}>{test?.likes || 0}</StatValue>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <StatLabel style={{ color: '#888', fontSize: '0.95rem' }}>댓글</StatLabel>
                  <StatValue style={{ color: '#222', fontSize: '1.1rem' }}>{commentCount}</StatValue>
                </div>
              </div>
              <FlexRow style={{ width: '100%', justifyContent: 'center', gap: 10, marginTop: 4 }}>
                <SocialButton onClick={handleLike} liked={liked} style={{ minWidth: 100, fontWeight: 700, fontSize: '1.05rem', color: liked ? '#fff' : '#222', background: liked ? '#7f7fd5' : '#fff', border: '2px solid #7f7fd5', boxShadow: '0 1px 4px rgba(127,127,213,0.08)' }}>
                  {liked ? '💖 좋아요 취소' : '🤍 좋아요'}
                </SocialButton>
                <SocialButton onClick={() => setShowCommentForm(!showCommentForm)} style={{ minWidth: 100, fontWeight: 700, fontSize: '1.05rem', color: '#fff', background: '#7f7fd5', border: '2px solid #7f7fd5', boxShadow: '0 1px 4px rgba(127,127,213,0.08)' }}>
                  💬 댓글 작성
                </SocialButton>
              </FlexRow>
            </div>
          </InfoCard>
          {/* 댓글 섹션 */}
          <CommentSection style={{
            maxWidth: 1200,
            margin: '40px auto',
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(80,80,120,0.10)',
            padding: '40px 32px'
          }}>
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
            {comments.length === 0 && (
              <div style={{ color: '#aaa', textAlign: 'center', margin: '1rem 0' }}>아직 댓글이 없습니다.</div>
            )}
            {comments.map((comment) => (
              <RenderedCommentItem key={comment.id} comment={comment} />
            ))}
          </CommentSection>
        </Section>
        <Footer style={{ marginTop: '0.5rem' }} />
      </MainWrap>
    </>
  );
} 