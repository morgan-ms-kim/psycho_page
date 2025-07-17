import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
// axios 인스턴스 생성
//'http://localhost:4000/api'
const apiClient = axios.create({
  baseURL: 'https://smartpick.website/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const MainFrame = styled.div`
  width: 100%;
  max-width: 500px;
  min-height: 100vh;
  
  margin: 0 auto;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  
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
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;


const BottomBar = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  position: fixed;
  bottom: 0;
  background: #6a5acd;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  z-index: 50;
`;

const IconButton = styled.button`

  max-Width:50px;
  background: none;
  border: none;
  padding: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 8px;
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
text-Align: left; 
left:100%; 
gap: 30px;
  margin-bottom: 8px;
`;
const InfoInput = styled.input`
  padding: 8px;
  max-width:200px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const CommentInput = styled.input`
  padding: 8px;
  width: 100%;
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

const TOPBAR_HEIGHT = 56; // px, 실제 높이에 맞게 조정
const BOTTOMBAR_HEIGHT = 64; // px, 실제 높이에 맞게 조정

function getUserKey() {
  let key = null;
  if (typeof window !== 'undefined') {
    key = localStorage.getItem('psycho_user_key');
    if (!key) {
      key = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 18);
      localStorage.setItem('psycho_user_key', key);
    }
  }
  return key;
}

export default function IframeTemplate({ src, test, ...props }) {
  // 좋아요, 댓글, 상세 모달 상태 및 함수
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(test?.likes || 0);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(test?.comments || 0);
  const [showComment, setShowComment] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [newComment, setNewComment] = useState({ nickname: '', content: '', password: '' });
  const [shareCount, setShareCount] = useState(0);
  const [recommendTests, setRecommendTests] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // DB에서 like, comment, liked(내가 누른적 있는지) 불러오기
  useEffect(() => {
    setIsClient(true);
    if (!test?.id) return;
    const userKey = getUserKey();
    // 테스트 정보(좋아요, 내가 누른적 있는지, 댓글 수 등)
    axios.get(`https://smartpick.website/api/tests/${test.id}`, { headers: { 'x-user-key': userKey } })
      .then(res => {
        setLikeCount(res.data.likes || 0);
        setCommentCount(res.data.comments || 0);
        setLiked(Boolean(res.data.userLiked));
      });
    // 댓글 목록
    axios.get(`https://smartpick.website/api/tests/${test.id}/comments`)
      .then(res => setComments(res.data.comments || []));
    // 추천 테스트
    axios.get(`https://smartpick.website/api/tests/${test.id}/recommends`)
      .then(res => setRecommendTests(res.data || []))
      .catch(() => setRecommendTests([]));
  }, [test?.id]);

  // 좋아요
  const handleLike = async () => {
    if (liked || !test?.id) return;
    const userKey = getUserKey();
    try {
      const res = await axios.post(`https://smartpick.website/api/tests/${test.id}/like`, {}, { headers: { 'x-user-key': userKey } });
      setLikeCount(res.data.likes || likeCount + 1);
      setLiked(true);
    } catch (e) {
      // 실패 시 무시
    }
  };

  // 댓글
  const handleComment = () => setShowComment(true);
  const closeCommentModal = () => setShowComment(false);
  const submitComment = async () => {
    if (!newComment.nickname || !newComment.content || !newComment.password || !test?.id) return;
    const userKey = getUserKey();
    try {
      const res = await axios.post(`https://smartpick.website/api/tests/${test.id}/comments`, {
        nickname: newComment.nickname,
        content: newComment.content,
        password: newComment.password,
      }, { headers: { 'x-user-key': userKey } });
      // 댓글 목록 갱신
      setComments(res.data.comments || []);
      setCommentCount((res.data.comments || []).length);
      setNewComment({ nickname: '', content: '', password: '' });
    } catch (e) {
      // 실패 시 무시
    }
  };

  // 상세
  const handleDetail = () => setShowDetail(true);
  const closeDetailModal = () => setShowDetail(false);

  return (
    <MainFrame
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        minHeight: '100vh',
        width: '100%',
        maxWidth: 500,
        margin: '0 auto',
        background: '#fff',
      }}
    >
      <TopBar
        style={{
          height: TOPBAR_HEIGHT,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={() => window.location.href = '/'}>🏠</IconButton>
        <IconButton onClick={() => window.history.back()}>←</IconButton>
      </TopBar>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          maxWidth: 500,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        {isClient && src ? (
          <iframe
            src={src}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
              background: '#fff',
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
            }}
            scrolling="auto"
            title="심리테스트"
            {...props}
            className="no-scrollbar"
          />
        ) : (
          <span>로딩중...</span>
        )}
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none !important; }
          .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        `}</style>
      </div>
      <BottomBar
        style={{
          height: BOTTOMBAR_HEIGHT,
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
        }}
      >
        <ActionWrap>
          <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '8px' }} onClick={handleLike}>{liked ? '❤️' : '🤍'}</button>
          <ActionCount>{likeCount}</ActionCount>
        </ActionWrap>
        <ActionWrap>
          <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '8px' }} onClick={handleComment}>💬</button>
          <ActionCount>{commentCount}</ActionCount>
        </ActionWrap>
        <ActionWrap>
          <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '8px' }} onClick={() => setShareCount(shareCount + 1)}>📤</button>
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
          <button onClick={closeCommentModal} style={{ float: 'right', background: 'none', border: 'none', fontSize: '1.2rem', color: '#fff', cursor: 'pointer' }}>✕</button>
        </ModalHeader>
        <ModalBody>
          <div style={{ marginBottom: 8 }}>
            <input placeholder="닉네임" value={newComment.nickname} onChange={e => setNewComment({ ...newComment, nickname: e.target.value })} style={{ marginRight: 8 }} />
            <input placeholder="비밀번호" type="password" value={newComment.password} onChange={e => setNewComment({ ...newComment, password: e.target.value })} style={{ marginRight: 8 }} />
          </div>
          <textarea rows={3} placeholder="댓글을 입력하세요" value={newComment.content} onChange={e => setNewComment({ ...newComment, content: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <button onClick={submitComment} style={{ marginBottom: 16 }}>댓글 작성</button>
          <div>
            {comments.map((c, i) => (
              <div key={i} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                <b>{c.nickname}</b> <span style={{ color: '#888', fontSize: '0.85rem' }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                <div style={{ whiteSpace: 'pre-line', marginTop: 4 }}>{c.content}</div>
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
          <button onClick={closeDetailModal} style={{ float: 'right', background: 'none', border: 'none', fontSize: '1.2rem', color: '#fff', cursor: 'pointer' }}>✕</button>
        </ModalHeader>
        <ModalBody>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 8 }}>{test?.title || '테스트'}</div>
          <div style={{ color: '#888', marginBottom: 16 }}>{test?.description || '테스트 설명'}</div>
          {/* 추천 테스트 카드 리스트 */}
          {recommendTests.length > 0 && (
            <div style={{ width: '100%', margin: '16px 0' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>추천 테스트</div>
              <RecommendList>
                {recommendTests.map((t, i) => (
                  <RecommendCard key={t.id || i} onClick={() => window.location.href = `/testview/${t.id}` }>
                    <div style={{ color: '#888', fontSize: '0.9rem' }}>👁️ {t.views || 0}</div>
                    {t.thumbnail && <img src={t.thumbnail} alt={t.title} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{t.title}</div>
                    <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: 8 }}>{t.desc}</div>
                  </RecommendCard>
                ))}
              </RecommendList>
            </div>
          )}
        </ModalBody>
      </ModalSheet>
    </MainFrame>
  );
}