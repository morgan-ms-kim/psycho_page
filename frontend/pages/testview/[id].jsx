import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import dynamic from 'next/dynamic';
import {
  MainWrap,
  Header,
  BackButton,
  LoadingWrap,
  ErrorMessage,
  Footer,
  InfoCard,
  CommentItem,
  Section,
  CommentSection,
  Title,
  SubTitle,
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

// TestContainer/로딩 스타일 공통 상수 선언
const CONTAINER_MAXWIDTH = '500px';
const CONTAINER_MINWIDTH = '500px';

// 스타일 컴포넌트 추가 및 개선
const TestContainer = styled.div`
  alignItems: 'center';  
  justifyContent: 'center';
  position: relative;
  height: 500px;
  min-height: 400px;
  max-height: 500px;
  width: 100%;
  max-width: 500px;
  min-width: 500px;
  margin: auto 0 auto;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0;
  overflow: hidden;
  box-sizing: border-box;
  @media (max-width: 1000px) {
    max-width: 98vw;
    min-width: 98vw;
    width: 98vw;
    border-radius: 16px;
    padding: 16px 0;
  }
  @media (max-width: 600px) {
    max-width: 98vw;
    min-width: 98vw;
    width: 98vw;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    margin: 0.5rem 0 1.5rem 0;
    padding: 8px 0;
  }
`;

const IframeTopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 2px 2px 0 0;
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
  min-width: 500px;
  max-width: 500px;
  height: 500px;
  max-height: 500px;
  border: none;
  background: #fff;
  border-radius: 0 0 24px 24px;
  flex: 1;
  overflow: hidden;
  display: block;
  position: relative;
  transform: translateZ(0);
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
    <CommentItem style={{
      marginBottom: 8,
      background: '#fff',
      color: '#222',
      boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: 'calc(100% - 32px)',
      maxWidth: 'calc(100% - 32px)',
      padding: '12px 16px',
      borderRadius: 8,
      minHeight: 'auto',
      gap: 12,
      overflow: 'hidden',
      wordWrap: 'break-word',
      boxSizing: 'border-box',
      margin: '0 16px 8px 16px',
    }}>
      {/* 제목 */}
      <span style={{ 
        fontWeight: 600, 
        color: '#6c63ff', 
        fontSize: '0.9rem',
        minWidth: 60,
        flexShrink: 0
      }}>
        {comment.nickname || '익명'}
      </span>
      {/* 댓글 내용 */}
      <div style={{ 
        fontSize: '0.95rem', 
        whiteSpace: 'pre-line', 
        wordBreak: 'break-all',
        lineHeight: '1.4',
        flex: 1,
        textAlign: 'left',
        overflow: 'hidden',
        wordWrap: 'break-word',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {comment.content}
      </div>
      {/* 날짜 */}
      <span style={{ 
        color: '#aaa', 
        fontSize: '0.8rem',
        minWidth: 80,
        flexShrink: 0,
        textAlign: 'right'
      }}>
        {comment.createdAt ? new Date(comment.createdAt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' }) : ''}
      </span>
    </CommentItem>
  );
}

// uuid 생성 함수
function getUserKey() {
  let key = localStorage.getItem('psycho_user_key');
  if (!key) {
    key = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 18);
    localStorage.setItem('psycho_user_key', key);
  }
  return key;
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
  const [buildExists, setBuildExists] = useState(false);
  const [checkedBuild, setCheckedBuild] = useState(false);
  const iframeRef = useRef();
  const adRef = useRef(null);

  // 테스트 데이터/댓글 병렬 로드
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      (async () => {
        const testId = getTestIdFromFolder(id);
        const userKey = getUserKey();
        return apiClient.get(`/tests/${testId}`, { headers: { 'x-user-key': userKey } });
      })(),
      (async () => {
        const testId = getTestIdFromFolder(id);
        return apiClient.get(`/tests/${testId}/comments`);
      })(),
      (async () => {
        if (/^test\d+$/.test(id)) {
          const res = await fetch(`/tests/${id}/index.html`, { method: 'HEAD' });
          return res.ok;
        }
        return false;
      })()
    ]).then(([testRes, commentsRes, buildOk]) => {
      setTest(testRes.data);
      setLiked(Boolean(testRes.data.userLiked));
      setComments(commentsRes.data.comments);
      setBuildExists(buildOk);
      setCheckedBuild(true);
      setLoading(false);
    }).catch(() => {
      setError('테스트를 불러오는데 실패했습니다. 서버 연결을 확인해주세요.');
      setLoading(false);
      setCheckedBuild(true);
    });
    // 방문 기록
    (async () => {
      try {
        const testId = getTestIdFromFolder(id);
        await apiClient.post(`/visitors`, { testId });
      } catch (error) {
        // 무시
      }
    })();
  }, [id]);
  const getIframeContent = () => {
  if (loading) {
    return (
      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',color:'#888'}}>
        테스트를 불러오는 중...
      </div>
    );
  }
  if (!checkedBuild && /^test\\d+$/.test(id)) {
    return (
      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',color:'#888'}}>
        테스트 앱 상태를 확인 중...
      </div>
    );
  }
  if (error) {
    return (
      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',color:'#d00'}}>
        🚫 {error}
      </div>
    );
  }
  if (!buildExists) {
    return (
      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',color:'#d00'}}>
        아직 빌드된 테스트 앱이 없습니다.
      </div>
    );
  }
  // 정상 iframe
  return (
    <TestIframe
      src={testUrl}
      title={test?.title || '테스트'}
      loading="lazy"
      scrolling="no"
      style={{
        width: '100%',
        minWidth: '100%',
        maxWidth: '100%',
        height: '500px',
        maxHeight: '500px',
        border: 'none',
        background: '#fff',
        borderRadius: '0 0 24px 24px',
        flex: 1,
        overflow: 'hidden',
        display: 'block',
        position: 'relative',
        transform: 'translateZ(0)',
      }}
    />
  );
};
  const handleLike = async () => {
    try {
      const testId = getTestIdFromFolder(id);
      const userKey = getUserKey();
      const response = await apiClient.post(`/tests/${testId}/like`, {}, {
        headers: { 'x-user-key': userKey }
      });
      setLiked(response.data.liked);
      setTest(prev => ({
        ...prev,
        likes: response.data.liked ? (prev.likes || 0) + 1 : Math.max(0, (prev.likes || 0) - 1)
      }));
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
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
      // 댓글 새로고침
      const response = await apiClient.get(`/tests/${testId}/comments`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  // 광고 스크립트 중복 삽입 방지
  useEffect(() => {
    if (!window.kakao || !window.kakao.adfit) {
      if (!document.querySelector('script[src*="daumcdn.net/kas/static/ba.min.js"]')) {
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = '//t1.daumcdn.net/kas/static/ba.min.js';
        scriptElement.async = true;
        scriptElement.onload = () => {
          if (window.kakao && window.kakao.adfit && window.kakao.adfit.render) {
            window.kakao.adfit.render();
          }
        };
        document.body.appendChild(scriptElement);
      }
    } else {
      setTimeout(() => {
        if (window.kakao && window.kakao.adfit && window.kakao.adfit.render) {
          window.kakao.adfit.render();
        }
      }, 500);
    }
  }, []);

  // TestContainer와 동일한 스타일을 변수로 분리
  const loadingContainerStyle = {
    width: '100%', // Section/TestContainer와 동일하게 전체 너비
    maxWidth: CONTAINER_MAXWIDTH,
    minWidth: CONTAINER_MINWIDTH,
    margin: '32px auto 0 auto',
    background: 'white',
    borderRadius: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 0',
  };
/*
  if (loading) {
    return (
      <MainWrap>
        <Header>
          <BackButton onClick={() => router.push('/')}>← 홈으로</BackButton>
        </Header>
        <LoadingWrap style={loadingContainerStyle}>
          <span style={{ color: '#888', fontSize: '1.1rem' }}>테스트를 불러오는 중...</span>
        </LoadingWrap>
      </MainWrap>
    );
  }
*/
  const commentCount = comments.length;
  const testUrl = `/tests/${id}/`;

  // iframe 렌더링 부분 (단순 고정형 + loading="lazy"만 적용)
  let iframeSection = null;
  if (!checkedBuild && /^test\d+$/.test(id)) {
    iframeSection = (
      <LoadingWrap style={loadingContainerStyle}>
        <span style={{ color: '#888', fontSize: '1.1rem' }}>테스트 앱 상태를 확인 중...</span>
      </LoadingWrap>
    );
  } else if (buildExists) {
    iframeSection = (
      <TestContainer>
        {getIframeContent()}
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
      <MainWrap
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 0,
          background: 'linear-gradient(135deg, #7f7fd5 0%, #86a8e7 100%)',
          width: '100vw',
          minWidth: '500px',
          maxWidth: '500px',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        <Section
          style={{
            flex: 1,
            maxWidth: '500px',
            margin: '20px auto 0 auto',
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 8px 40px rgba(80,80,120,0.12)',
            padding: '0 0 24px 0',
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Header style={{ marginBottom: 0, padding: '0.5rem 2rem 0.5rem 2rem', background: 'rgba(255,255,255,0.05)' }}>
            <BackButton onClick={() => router.push('/')}>← 홈으로</BackButton>
          </Header>
          {/* 에러 메시지(있을 때만) */}
          {error && (
            <ErrorMessage>
              <p>🚫 {error}</p>
            </ErrorMessage>
          )}
          {/* 광고+InfoCard 한 줄 배치 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 16,
              width: '100%',
              margin: '0 auto',
              maxWidth: '500px',
            }}
          >
            {iframeSection}
            <InfoCard as={TestContainer} style={{
              maxWidth: '500px',
              minWidth: 0,
              margin: '0 auto',
              background: '#fff',
              borderRadius: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 'auto',
              flex: 'none',
              height: 'auto',
              minHeight: 0,
              maxHeight: 'none',
              overflow: 'visible'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', textAlign: 'center', padding: 0, margin: 0 }}>
                <Title style={{ color: '#222', fontSize: '1.3rem', marginBottom: 4 }}>{test?.title || '테스트'}</Title>
                <SubTitle style={{ color: '#555', fontSize: '1rem', marginBottom: 8 }}>{test?.description || '테스트 설명이 없습니다!'}</SubTitle>
                <div style={{ display: 'flex', gap: 24, margin: '8px 0', justifyContent: 'center', width: '100%' }}>
                  <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleLike}>
                    <StatLabel style={{ color: liked ? '#ff5e5e' : '#bbb', fontSize: '1.2rem', transition: 'color 0.2s' }}>
                      {liked ? '❤️' : '🤍'}
                    </StatLabel>
                    <StatValue style={{ color: '#ff5e5e', fontSize: '1.1rem' }}>{test?.likes || 0}</StatValue>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <StatLabel style={{ color: '#888', fontSize: '1.2rem' }}>👁️</StatLabel>
                    <StatValue style={{ color: '#222', fontSize: '1.1rem' }}>{test?.views || 0}</StatValue>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <StatLabel style={{ color: '#888', fontSize: '1.2rem' }}>💬</StatLabel>
                    <StatValue style={{ color: '#222', fontSize: '1.1rem' }}>{commentCount}</StatValue>
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>
          {/* 댓글 섹션 */}
          <CommentSection style={{
            maxWidth: '500px',
            minWidth: 0,
            margin: '32px auto',
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(80,80,120,0.10)',
            padding: '24px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}>
            <CommentHeader style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, display: 'flex', padding: '0 24px', boxSizing: 'border-box' }}>
              <CommentTitle>💬 댓글 ({commentCount})</CommentTitle>
              <CommentButton onClick={() => setShowCommentForm(!showCommentForm)} style={{ marginLeft: 'auto', marginRight: 0 }}>
                {showCommentForm ? '취소' : '댓글 작성'}
              </CommentButton>
            </CommentHeader>
            {showCommentForm && (
              <CommentFormContainer style={{ width: '100%', maxWidth: '100%', margin: '0 auto 24px auto' }}>
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
              <div style={{ color: '#aaa', textAlign: 'center', margin: '1rem 0' }}>아직 댓글이 없습니다!</div>
            )}
            <div style={{
              width: '100%',
              maxWidth: '100%',
              margin: '0 auto',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
              boxSizing: 'border-box',
              padding: 0
            }}>
              {comments.map((comment) => (
                <RenderedCommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </CommentSection>
          {/* 광고 컨테이너 - 그대로 */}
        <div
          style={{
            width: '100%',
            minWidth: 320,
            maxWidth: 728,
            margin: '0 auto 24px auto',
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
        </Section>
        <Footer style={{ marginTop: '0.5rem' }} />
      </MainWrap>
    </>
  );
}