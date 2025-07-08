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
import MobileTestFrame from './tests/mobiletest.jsx';

// axios 인스턴스 생성
const apiClient = axios.create({
  //우분투용
  baseURL: 'https://smartpick.website/api',
  //윈도우용
  //baseURL: 'http://localhost:4000/api',
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
  else if (folderName.startsWith('template')) {
    return folderName.replace('template', '');
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
  max-height: 700px;
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
  padding: 0;
  margin: 0;
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
  max-height: 700px;
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
  const [TemplateComponent, setTemplateComponent] = useState(null);
  const [isTemplateTest, setIsTemplateTest] = useState(false);
  // 테스트 데이터/댓글 병렬 로드
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    console.log('testId : ' + id);
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

  // 템플릿 테스트 분기 렌더링
  useEffect(() => {
    console.log("템플릿 테스트 분기 렌더링 : "+id)
    if (id && /^template\d+$/.test(id)) {
      setIsTemplateTest(true);
      const tryImport = async () => {
        try {
          console.log(`/frontend/public/tests/${test.folder}/src/App.js`)
          const mod = await import(`/frontend/public/tests/${test.folder}/src/App.js`);
          console.log(mod)
          setTemplateComponent(() => mod.default);

        } catch {
          try {
            console.log(`/frontend/public/tests/${test.folder}/src/App.jsx`)
            const mod = await import(`/frontend/public/tests/${test.folder}/src/App.jsx`);
            setTemplateComponent(() => mod.default);
          } catch {
            try {
              console.log(`/frontend/public/tests/${test.folder}/src/App.tsx`)
              const mod = await import(`/frontend/public/tests/${test.folder}/src/App.tsx`);
              setTemplateComponent(() => mod.default);
            } catch {
              
              console.log(`./tests/${test.folder}/src/App.tsx`)
              setTemplateComponent(() => () => <div>템플릿 컴포넌트 로드 실패</div>);
            }
          }
        }
      };
      tryImport();
    } else {
      setTemplateComponent(null);
    }
  }, [test]);

  console.log('렌더링', { test, TemplateComponent });

  // 렌더링 분기
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!test) return <div>테스트 정보 없음</div>;
  
  // 템플릿 테스트면 MobileTestFrame + 동적 컴포넌트
  if (/^template\d+$/.test(test.folder) && TemplateComponent) {
    return (
      <MobileTestFrame
        TestComponent={TemplateComponent}
        id={id}
        test={test}
      />
    );
  }

  // 일반 test형 테스트는 iframe
  return (
    <div style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
      <Head>
        <title>{test?.title ? `${test.title} - PSYCHO` : '테스트 상세 - PSYCHO'}</title>
      </Head>
      <iframe
        src={`/tests/${test.folder}/index.html`}
        title={test.title || '테스트'}
        style={{
          width: '100%',
          minHeight: 600,
          border: 'none',
          borderRadius: 12,
          background: '#fff',
        }}
        loading="lazy"
        scrolling="no"
      />
      {/* 댓글, 좋아요, 광고 등 기존 UI는 아래에 추가 */}
    </div>
  );
}