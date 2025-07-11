import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import dynamic from 'next/dynamic';
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
  height
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
  z-index: 10;
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

// 프레임 컴포넌트
export default function MobileTestFrame({ id, test }) {
  const [comments, setComments] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [showComment, setShowComment] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [newComment, setNewComment] = useState({ id: '', password: '', content: '' });
  const [recommendTests, setRecommendTests] = useState([]);
  const [randomCode, setRandomCode] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [TemplateComponent, setTemplateComponent] = useState(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);

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
  // testId로 테스트 정보, 댓글, 추천 테스트 불러오기
  useEffect(() => {
    const testId = getTestIdFromFolder(id);
    if (!testId || !test) return;
    
    setLikeCount(test.likes || 0);
    setViewCount(test.views || 0);
    setCommentCount(test.comments || 0);
    
    // 추천 테스트 불러오기
    apiClient.get(`/tests/${testId}/recommends`)
      .then(res => setRecommendTests(res.data || []))
      .catch(() => setRecommendTests([]));
    
    // 댓글 불러오기
    apiClient.get(`/tests/${testId}/comments`)
      .then(res => setComments(res.data.comments || []))
      .catch(() => setComments([]));
    
  }, [id, test]);

  // Dynamic import 로직
  useEffect(() => {
    if (test && test.folder && /^template\d+$/.test(test.folder)) {
    ////////////
    /*  setIsTemplateLoading(true);
      const tryImport = async () => {
        console.log(test.folder);
        if (!appModuleMap) {
          console.error(`모듈 정보 없음: ${test.folder}`);
          return;
        }
        const importModule = appModuleMap[test.folder];
        test.folder.replace('./','../../');
        console.log(test.folder);
        console.log(test.folder.replace('./','../../'));
        if (!importModule) {
          console.log(`❌ ${test.folder}: 모듈 정보를 찾을 수 없음`);
          setTemplateComponent(() => null);
          setIsTemplateLoading(false);
          return;
        }

        try {
          console.log(`📦 ${test.folder} 모듈 로딩 중...`);
          setIsTemplateLoading(true);
          // 함수를 호출하여 모듈 import
          const DynamicComponent = dynamic(() =>
            appModuleMap[test.folder](), // 함수 호출해서 import 실행
            { loading: () => <p>로딩 중...</p>, ssr: false }
          );
          setTemplateComponent(DynamicComponent);
          setIsTemplateLoading(false);
          console.log(`✅ ${test.folder} 모듈 로딩 완료`);
        } catch (error) {
          console.error(`❌ ${test.folder} 모듈 로딩 실패:`, error);
          setTemplateComponent(() => null);
          setIsTemplateLoading(false);
        }
      };
      tryImport();
   */
    // /////////////
    // 
    // 
    setIsTemplateLoading(true);
    const tryImport = async () => {
      console.log(test.folder);
      const extensions = ['.js', '.jsx', '.tsx'];
      let found = false;
      setIsTemplateLoading(true);
     
        for (const ext of extensions) {
          try {
           const DynamicComponent = dynamic(() => import(`../../tests/${test.folder}/src/App${ext}`), { 
              
              loading: () => <p>로딩 중...</p>
              ,ssr: false });
            if(DynamicComponent){
            console.log(`../../tests/${test.folder}/src/App${ext}`);
            setTemplateComponent(()=>DynamicComponent);
            found = true;
            console.log(`✅ ${test.folder} 모듈 로딩 완료`);
            break;
            }
          } catch (e) {
            // 이 catch는 실행되지 않음 (빌드 타임 에러)
              console.error(`❌ ${test.folder} 모듈 로딩 실패:`, error);
              setTemplateComponent(() => null);
              setIsTemplateLoading(false);
          }
        }
          setIsTemplateLoading(false);
          if (!found) {
            
            console.error(`❌ ${test.folder} !found 모듈 로딩 실패:`, error);
            setTemplateComponent(() => null);
          }
    };
    tryImport();
 



     } else {
      setTemplateComponent(null);
      setIsTemplateLoading(false);
    }
  }, [test?.folder]);

  // 댓글 추가
  const addComment = async (comment) => {
    setComments(prev => [...prev, comment]);
  };

  // 좋아요
  const like = async () => {
    setLikeCount(prev => prev + 1);
  };

  // 결과 저장
  const saveResult = async (result) => {
    alert('결과 저장(더미)!');
  };

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
  }, []);

  const handleLike = () => {
    setLikeCount(likeCount + 1);
  };

  const handleShare = () => {
    setShareCount(shareCount + 1);
  };

  const submitComment = () => {
    if (!newComment.id || !newComment.password || !newComment.content) return;
    
    setComments([...comments, { ...newComment, date: new Date().toISOString() }]);
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
      <div style={{ flex: 1, width: '100%', maxWidth: '500px', marginTop: 56, marginBottom: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 1px' }}>
        {/* 테스트 제목, 설명, 조회수, 좋아요, 댓글 수 */}
        
        
        {/* 동적 템플릿 컴포넌트 */}
        {isTemplateLoading && <p>로딩 중...</p>}
        {TemplateComponent && !isTemplateLoading && <TemplateComponent />}
        {test && (
          <div style={{ width: '100%', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 8 , background:'transparent'}}>
              <span> 참여횟수 | {viewCount}번</span>
            </div>
          </div>
        )}
        
      </div>
      
      <BottomBar>
        <ActionWrap>
          <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '8px' }} onClick={handleLike}>❤️</button>
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
        
      <ModalHeader style={{
    position: 'relative',
    padding: '12px 16px',
    width:'100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  }}>
        댓글 ({commentCount})
        <button
    onClick={closeCommentModal}
    style={{
      position: 'absolute',
      width:'50px',
      right:'1%',
      
      background: 'none',
      border: 'none',
      fontSize: '1.2rem',
      color: '#fff',
      cursor: 'pointer',
    }}
  >✕</button>
        </ModalHeader>
        <ModalBody>

          

//////////////////////

            {/* 댓글 섹션 */}
            {/* <CommentSection style={{
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
            </CommentSection> */}
/////////////////////




          <CommentInputRow>
            <InfoInput placeholder="ID" value={newComment.id} onChange={e => setNewComment({ ...newComment, id: e.target.value })} />
            <InfoInput placeholder="PW" type="password" value={newComment.password} onChange={e => setNewComment({ ...newComment, password: e.target.value })} />
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
      <ModalOverlay open={showDetail} onClick={closeDetailModal}  />
      <ModalSheet open={showDetail} >
        <ModalHeader style={{
    position: 'relative',
    padding: '12px 16px',
    width:'100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  }}>
        상세 정보
        <button
    onClick={closeDetailModal}
    style={{
      position: 'absolute',
      width:'50px',
      right:'1%',
      
      background: 'none',
      border: 'none',
      fontSize: '1.2rem',
      color: '#fff',
      cursor: 'pointer',
    }}
  >✕</button>
        </ModalHeader>
        <ModalBody>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 8, color: '#fff' }}>{test?.title || '테스트'}</div>
          <div style={{ color: '#e6e6fa', marginBottom: 16 }}>{test?.description || '테스트 설명'}</div>
          
         
          
          {/**<div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <span style={{ color: '#fff' }}>❤️ {likeCount}</span>
            <span style={{ color: '#fff' }}>💬 {commentCount}</span>
            <span style={{ color: '#fff' }}>🔗 {shareCount}</span>
          </div>**/}
          <RecommendList>
            
            {/* 추천 테스트 카드 */}
        {recommendTests.length > 0 && (
          <div style={{ width: '100%', margin: '16px 0' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>추천 테스트</div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '8px 0' }}>
              {recommendTests.map((t, i) => (
                <div key={t.id || i} style={{ minWidth: 140, maxWidth: 180, background: '#f5f5f5', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} onClick={() => window.location.href = `/testview/${t.id}`}>
                  
                  <div style={{ color: '#888', fontSize: '0.9rem' }}>👁️ {t.views || 0}</div>
                  {t.thumbnail && <img src={t.thumbnail} alt={t.title} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{t.title}</div>
                  <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: 8 }}>{t.desc}</div>
                  {/**<button style={{ padding: '6px 12px', borderRadius: 8, background: '#6c63ff', color: '#fff', border: 'none', fontWeight: 500, fontSize: '0.95rem', marginTop: 8 }} onClick={() => window.location.href = `/testview/${t.id}`}>바로가기</button>**/}
                </div>
              ))}
            </div>
          </div>
        )}
          </RecommendList>
        </ModalBody>
      </ModalSheet>
    </MainFrame>
  );
}