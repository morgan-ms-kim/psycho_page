import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://smartpick.website/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const MainFrame = styled.div`
  width: 100%;
  max-width: 500px;
  min-height: 100vh;
  margin: 0 auto;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-x: hidden;
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  background: #6a5acd;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 16px 0 16px;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 8px;
`;

const BottomBar = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #6a5acd;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  z-index: 10;
`;

const ActionWrap = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActionCount = styled.span`
  font-size: 1rem;
  color: #fff;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 15;
  display: ${({ open }) => (open ? 'block' : 'none')};
`;

const ModalSheet = styled.div`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: 500px;
  height: ${({ open }) => (open ? '60vh' : '0')};
  background: #6a5acd;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
  transition: height 0.3s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
  z-index: 20;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 16px;
  font-weight: bold;
  font-size: 1.1rem;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.2);
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const CommentInputRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const CommentButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  background: #6c63ff;
  color: #fff;
  border: none;
  font-weight: 500;
  cursor: pointer;
`;

const RecommendList = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0 0 0;
`;

const RecommendCard = styled.div`
  min-width: 140px;
  max-width: 180px;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

export default function MobileTestApp() {
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [showComment, setShowComment] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ id: '', password: '', content: '' });
  const [recommendTests, setRecommendTests] = useState([]);
  const [randomCode, setRandomCode] = useState('');
  const [testResult, setTestResult] = useState(null);


useEffect(() => {
  // URL 파라미터에서 모달 상태 확인
  const urlParams = new URLSearchParams(window.location.search);
  const modalType = urlParams.get('modal');
  const resultCode = urlParams.get('result');
  const randomCode = urlParams.get('code');
  
  if (modalType === 'comment') {
    setShowComment(true);
  } else if (modalType === 'detail') {
    setShowDetail(true);
  }
  
  // 랜덤 코드가 있으면 설정
  if (randomCode) {
    setRandomCode(randomCode);
  }
  
  // 결과 코드가 있으면 결과 로드
  if (resultCode) {
    loadTestResult(resultCode);
  }

  // [API 요청 비활성화] 조회수, 좋아요, 댓글, 공유, 추천 테스트 목록 불러오기
  /*
  apiClient.get('/tests/mobiletest').then(res => {
    setViewCount(res.data.views || 0);
    setLikeCount(res.data.likes || 0);
    setCommentCount(res.data.comments || 0);
    setShareCount(res.data.shares || 0);
    setComments(res.data.commentList || []);
    setRecommendTests(res.data.recommendList || []);
  });
  */
  // 더미 데이터로 UI 테스트 가능하도록 기본값 설정
  setViewCount(1234);
  setLikeCount(56);
  setCommentCount(7);
  setShareCount(3);
  setComments([
    { id: 'user1', content: '좋은 테스트네요!', date: new Date().toISOString() },
    { id: 'user2', content: '재미있었어요.', date: new Date().toISOString() }
  ]);
  setRecommendTests([
    { id: 1, title: '심리 테스트 A', desc: '당신의 성격을 알아보세요' },
    { id: 2, title: 'MBTI 테스트 B', desc: '당신의 유형은?' }
  ]);
}, []);

const handleLike = () => {
  // [API 요청 비활성화] 좋아요 증가
  // apiClient.post('/tests/mobiletest/like').then(() => setLikeCount(likeCount + 1));
  setLikeCount(likeCount + 1); // 임시 로컬 증가
};

const handleShare = () => {
  // [API 요청 비활성화] 공유수 증가
  // apiClient.post('/tests/mobiletest/share').then(() => setShareCount(shareCount + 1));
  setShareCount(shareCount + 1); // 임시 로컬 증가
};

const submitComment = () => {
  if (!newComment.id || !newComment.password || !newComment.content) return;
  
  // [API 요청 비활성화] 댓글 등록
  /*
  apiClient.post('/tests/mobiletest/comments', newComment).then(() => {
    setComments([...comments, { ...newComment, date: new Date().toISOString() }]);
    setNewComment({ id: '', password: '', content: '' });
  });
  */
  setComments([...comments, { ...newComment, date: new Date().toISOString() }]); // 임시 추가
  setNewComment({ id: '', password: '', content: '' });
};


  const handleComment = () => {
  setShowComment(true);
  // URL에 모달 상태 추가
  const url = new URL(window.location);
  url.searchParams.set('modal', 'comment');
  window.history.pushState({}, '', url);
};

const handleDetail = () => {
  setShowDetail(true);
  // URL에 모달 상태 추가
  const url = new URL(window.location);
  url.searchParams.set('modal', 'detail');
  window.history.pushState({}, '', url);
};

const closeCommentModal = () => {
  setShowComment(false);
  // URL에서 모달 파라미터 제거
  const url = new URL(window.location);
  url.searchParams.delete('modal');
  window.history.pushState({}, '', url);
};

const closeDetailModal = () => {
  setShowDetail(false);
  // URL에서 모달 파라미터 제거
  const url = new URL(window.location);
  url.searchParams.delete('modal');
  window.history.pushState({}, '', url);
};

// 6자리 랜덤 알파벳 생성
const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 랜덤 코드 생성 및 URL 업데이트
const handleRandomCode = async () => {
  const code = generateRandomCode();
  setRandomCode(code);
  
  // URL에 랜덤 코드 추가
  const url = new URL(window.location);
  url.searchParams.set('code', code);
  window.history.pushState({}, '', url);
  
  // 전체 링크를 클립보드에 복사
  const fullLink = url.toString();
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(fullLink);
      alert('랜덤 코드 링크가 클립보드에 복사되었습니다!');
    } else {
      // 클립보드 API가 지원되지 않는 경우
      const textArea = document.createElement('textarea');
      textArea.value = fullLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('랜덤 코드 링크가 클립보드에 복사되었습니다!');
    }
  } catch (error) {
    console.error('클립보드 복사 실패:', error);
    alert('클립보드 복사에 실패했습니다.');
  }
  
  try {
    // 서버에 랜덤 코드 전송
    // await apiClient.post('/tests/random-code', { code });
    console.log('랜덤 코드 전송 완료:', code);
  } catch (error) {
    console.error('랜덤 코드 전송 실패:', error);
  }
};

// 결과 생성 및 URL 업데이트
const handleGenerateResult = async () => {
  if (!randomCode) {
    alert('먼저 랜덤 코드를 생성해주세요!');
    return;
  }
  
  try {
    // 서버에 결과 요청 (임시로 더미 결과 생성)
    // const response = await apiClient.post('/tests/generate-result', { code: randomCode });
    // const result = response.data.result;
    
    // 임시 더미 결과 생성
    const dummyResults = [
      '당신은 창의적이고 독창적인 성격입니다!',
      '분석적이고 논리적인 사고를 가진 사람입니다.',
      '사교적이고 친화력이 뛰어난 성격입니다.',
      '신중하고 책임감이 강한 사람입니다.',
      '열정적이고 도전적인 성격입니다!'
    ];
    const result = dummyResults[Math.floor(Math.random() * dummyResults.length)];
    setTestResult(result);
    
    // URL에 결과 추가
    const url = new URL(window.location);
    url.searchParams.set('result', randomCode);
    window.history.pushState({}, '', url);
    
    // 전체 링크를 클립보드에 복사
    const fullLink = url.toString();
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(fullLink);
      alert('결과 링크가 클립보드에 복사되었습니다!');
    } else {
      // 클립보드 API가 지원되지 않는 경우
      const textArea = document.createElement('textarea');
      textArea.value = fullLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('결과 링크가 클립보드에 복사되었습니다!');
    }
  } catch (error) {
    console.error('결과 생성 실패:', error);
    alert('결과 생성에 실패했습니다.');
  }
};

// 결과 코드로 테스트 결과 로드
const loadTestResult = async (code) => {
  try {
    // 서버에서 결과 요청 (임시로 더미 결과 사용)
    // const response = await apiClient.get(`/tests/result/${code}`);
    // setTestResult(response.data.result);
    
    // 임시로 더미 결과 생성 (실제로는 서버에서 가져와야 함)
    const dummyResults = [
      '당신은 창의적이고 독창적인 성격입니다!',
      '분석적이고 논리적인 사고를 가진 사람입니다.',
      '사교적이고 친화력이 뛰어난 성격입니다.',
      '신중하고 책임감이 강한 사람입니다.',
      '열정적이고 도전적인 성격입니다!'
    ];
    const result = dummyResults[Math.floor(Math.random() * dummyResults.length)];
    setTestResult(result);
    setRandomCode(code);
    console.log('테스트 결과 로드 완료:', result);
  } catch (error) {
    console.error('테스트 결과 로드 실패:', error);
    alert('결과를 불러올 수 없습니다.');
  }
};


  return (
    <MainFrame>
      <TopBar style={{ background: '#6a5acd' }}>
        <IconButton onClick={() => window.location.href = '/'}>🏠</IconButton>
        <IconButton onClick={() => window.history.back()}>←</IconButton>
      </TopBar>
      <div style={{ flex: 1, width: '100%', maxWidth: '500px', marginTop: 56, marginBottom: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        {/* 메인 컨텐츠 영역 */}
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '24px 0 8px 0', textAlign: 'center' }}>모바일 전용 테스트</div>
        <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: 16, textAlign: 'center' }}>조회수: {viewCount}</div>
       {/* 랜덤 코드 생성 섹션 */}
       <div style={{ marginBottom: 20, padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#fff' }}>랜덤 코드 생성</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button 
                onClick={handleRandomCode}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  background: '#fff', 
                  color: '#6a5acd', 
                  border: 'none', 
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                랜덤 코드 생성
              </button>
              <button 
                onClick={handleGenerateResult}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  background: '#6c63ff', 
                  color: '#fff', 
                  border: 'none', 
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                결과 생성
              </button>
            </div>
            {randomCode && (
              <div style={{ color: '#000', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center' }}>
                생성된 코드: {randomCode}
              </div>
            )}
            {testResult && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}>테스트 결과:</div>
                <div style={{ color: '#e6e6fa' }}>{testResult}</div>
              </div>
            )}
          </div>
      </div>
      
      <BottomBar>
        <ActionWrap>
          <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '8px' }} onClick={handleLike}>👍</button>
          <ActionCount>{likeCount}</ActionCount>
        </ActionWrap>
        <ActionWrap>
          <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '8px' }} onClick={handleComment}>💬</button>
          <ActionCount>{commentCount}</ActionCount>
        </ActionWrap>
        <ActionWrap>
          <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '8px' }} onClick={handleShare}>📤</button>
          <ActionCount>{shareCount}</ActionCount>
        </ActionWrap>
        <ActionWrap>
          <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '8px' }} onClick={handleDetail}>ℹ️</button>
        </ActionWrap>
      </BottomBar>
      {/* 댓글 모달 */}
      <ModalOverlay open={showComment} onClick={closeCommentModal} />
      <ModalSheet open={showComment}>
        <ModalHeader>
          댓글 ({commentCount})
          <span style={{ float: 'right' }}>
            <button onClick={closeCommentModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#fff' }}>✕</button>
          </span>
        </ModalHeader>
        <ModalBody>
          <CommentInputRow>
            <CommentInput placeholder="ID" value={newComment.id} onChange={e => setNewComment({ ...newComment, id: e.target.value })} />
            <CommentInput placeholder="PW" type="password" value={newComment.password} onChange={e => setNewComment({ ...newComment, password: e.target.value })} />
            <CommentButton onClick={() => localStorage.setItem('comment_id', newComment.id)}>ID저장</CommentButton>
            <CommentButton onClick={() => localStorage.setItem('comment_pw', newComment.password)}>PW저장</CommentButton>
          </CommentInputRow>
          <CommentInput as="textarea" rows={3} placeholder="댓글을 입력하세요" value={newComment.content} onChange={e => setNewComment({ ...newComment, content: e.target.value })} />
          <CommentButton style={{ marginTop: 8 }} onClick={submitComment}>댓글 작성</CommentButton>
          <div style={{ marginTop: 16 }}>
            {comments.map((c, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', padding: '8px 0' }}>
                <b style={{ color: '#fff' }}>{c.id}</b> <span style={{ color: '#e6e6fa', fontSize: '0.85rem' }}>{c.date ? new Date(c.date).toLocaleString() : ''}</span>
                <div style={{ whiteSpace: 'pre-line', marginTop: 4, color: '#fff' }}>{c.content}</div>
              </div>
            ))}
          </div>
        </ModalBody>
      </ModalSheet>
      {/* 상세 모달 */}
      <ModalOverlay open={showDetail} onClick={closeDetailModal} />
      <ModalSheet open={showDetail}>
        <ModalHeader>
          상세 정보
          <span style={{ float: 'right' }}>
            <button onClick={closeDetailModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#fff' }}>✕</button>
          </span>
        </ModalHeader>
        <ModalBody>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 8, color: '#fff' }}>모바일 전용 테스트 제목</div>
          <div style={{ color: '#e6e6fa', marginBottom: 16 }}>이곳에 상세 설명이 들어갑니다. 테스트의 목적, 방법, 특징 등을 안내합니다.</div>
          
         
          
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <span style={{ color: '#fff' }}>❤️ {likeCount}</span>
            <span style={{ color: '#fff' }}>💬 {commentCount}</span>
            <span style={{ color: '#fff' }}>🔗 {shareCount}</span>
          </div>
          <div style={{ fontWeight: 'bold', margin: '16px 0 8px 0', color: '#fff' }}>추천 테스트</div>
          <RecommendList>
            {recommendTests.map((t, i) => (
              <RecommendCard key={i}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{t.title}</div>
                <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: 8 }}>{t.desc}</div>
                <button style={{ padding: '6px 12px', borderRadius: 8, background: '#6c63ff', color: '#fff', border: 'none', fontWeight: 500, fontSize: '0.95rem' }} onClick={() => window.location.href = `/testview/${t.id}`}>바로가기</button>
              </RecommendCard>
            ))}
          </RecommendList>
        </ModalBody>
      </ModalSheet>
    </MainFrame>
  );
}