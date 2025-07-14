import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
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
import MobileTestFrame from './mobiletest.jsx';
import MobileTestFrame_ from './iframeTemplate.jsx';


// axios 인스턴스 생성
//baseURL: 'http://localhost:4000/api',
const apiClient = axios.create({
  baseURL: 'https://smartpick.website/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const getTestIdFromFolder = (folderName) => {
  if (folderName.startsWith('test') || folderName.startsWith('template')) {
    return folderName.replace('test', '').replace('template', '');
  }
  return folderName;
};

const CONTAINER_MAXWIDTH = '500px';
const CONTAINER_MINWIDTH = '500px';

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
      <span style={{ fontWeight: 600, color: '#6c63ff', fontSize: '0.9rem', minWidth: 60, flexShrink: 0 }}>{comment.nickname || '익명'}</span>
      <div style={{ fontSize: '0.95rem', whiteSpace: 'pre-line', wordBreak: 'break-all', lineHeight: '1.4', flex: 1, textAlign: 'left', overflow: 'hidden', wordWrap: 'break-word', maxWidth: '100%', boxSizing: 'border-box' }}>{comment.content}</div>
      <span style={{ color: '#aaa', fontSize: '0.8rem', minWidth: 80, flexShrink: 0, textAlign: 'right' }}>{comment.createdAt ? new Date(comment.createdAt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' }) : ''}</span>
    </CommentItem>
  );
}

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

  // 상태 선언
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [test, setTest] = useState(null);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState({ nickname: '', content: '', password: '' });
  const [buildExists, setBuildExists] = useState(false);
  const [checkedBuild, setCheckedBuild] = useState(false);

  // URL 정규화
  useEffect(() => {
    if (id && typeof id === 'string') {
      if (id.startsWith('testtest')) {
        const normalizedId = id.replace('testtest', 'test');
        router.replace(`/testview/${normalizedId}`);
        return;
      }
    }
  }, [id, router]);

  // 데이터/댓글/빌드 체크
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
        await apiClient.post(`/visitors`, { testId, page: testId, userAgent: navigator.userAgent });
      } catch (error) {
        // 무시
      }
    })();
  }, [id]);

  // 템플릿 테스트 여부
  const isTemplateTest = test && test.folder && /^template\d+$/.test(test.folder);
  console.log('isTemplateTest: ', isTemplateTest)


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
  // dynamic import 및 setTemplateComponent 관련 코드 완전 제거
  // MobileTestFrame에 test, id만 넘김
  if (loading && isTemplateTest) {
    return (
      <MobileTestFrame
        id={id}
        test={test}
      />
    )
  }
  else if (isTemplateTest) {
    return (
      <MobileTestFrame
        id={id}
        test={test}
      />
    )
  }
  else {

    // 렌더링 분기
    if (loading) {
      return (
        <MainWrap>
          <Header>
            <BackButton onClick={() => router.push('/')}>← 홈으로</BackButton>
          </Header>
          <LoadingWrap style={{ width: '100%', maxWidth: CONTAINER_MAXWIDTH, minWidth: CONTAINER_MINWIDTH, margin: '32px auto 0 auto', background: 'white', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
            <span style={{ color: '#888', fontSize: '1.1rem' }}>테스트를 불러오는 중...</span>
          </LoadingWrap>
        </MainWrap>
      );
    }
    if (error) {
      return <ErrorMessage>🚫 {error}</ErrorMessage>;
    }
    if (!test) {
      return <ErrorMessage>테스트 정보 없음</ErrorMessage>;
    }


    // 이하 기존 일반 test형(iframe) 분기 및 댓글, 광고 등 렌더링
    const commentCount = comments.length;
    const testUrl = `../../public/tests/${id}/`;

    // iframe 렌더링 부분 (단순 고정형 + loading="lazy"만 적용)
    let iframeSection = null;
    if (!checkedBuild && /^test\d+$/.test(id)) {
      iframeSection = (
        <LoadingWrap style={{ width: '100%', maxWidth: CONTAINER_MAXWIDTH, minWidth: CONTAINER_MINWIDTH, margin: '32px auto 0 auto', background: 'white', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
          <span style={{ color: '#888', fontSize: '1.1rem' }}>테스트 앱 상태를 확인 중...</span>
        </LoadingWrap>
      );
    } else if (buildExists) {
      iframeSection = (
          <MobileTestFrame_
            id={id}
            test={test}>
          </MobileTestFrame_>

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
          <title>{test?.title ? `${test.title} - 씸풀` : '씸풀 - 심심풀이에 좋은 심리테스트'}</title>
        </Head>
         {iframeSection}

            {/* 광고 컨테이너 - 그대로 */}
           
         
          <Footer style={{ marginTop: '0.5rem' }} />
         
      </>
    );
  }
}

