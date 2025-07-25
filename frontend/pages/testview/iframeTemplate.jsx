import React, { useState, useEffect, useRef } from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaFacebook, FaTwitterSquare, FaLink, FaComment,
  FaShareSquare, FaInfo, FaInfoCircle, FaThumbsUp, FaChevronDown, FaAngleDown
} from 'react-icons/fa';
import { SiKakaotalk } from 'react-icons/si';

import Image from 'next/image';
import Div100vh from 'react-div-100vh';
import { ScrollListSection, getImagePath } from '../index';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Logo,
  ButtonWrapper,
  Bubble,
  RedCircle,
  HeartWrapper,
  LittleBubble
} from '../../components/StyledComponents';

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
  background: #6a5acd ;
  background: linear-gradient(45deg,rgb(156, 145, 252) , #7f7fd5, #6a5acd);
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
  background: linear-gradient(135deg, #6a5acd, #7f7fd5, #b3aaff);
  align-items: center;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0;
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

const IframeSection = styled.iframe`

width: 100%;
height: 100%;
border: none;
display: block;
background: #fff;
flex: 1;
min-height: 0;
overflow: auto;
fullscreen:allow;
  object-fit: cover

  &::-webkit-scrollbar {
    display: none; /* 모바일에서 스크롤바 감춤 */
  }

`;

const ActionCount = styled.span`
  font-size: 1.1rem;
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
  background: linear-gradient(45deg,rgb(156, 145, 252) , #7f7fd5, #6a5acd);
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
  width:100%;
  font-weight: bold;
  font-size: 1.1rem;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  display: flex;         // 또는 grid
  align-items: center;   // 수직 정렬
  justify-content: space-around; // 가로 정렬 간격
  gap: 10px;             // 항목 사이 간격
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: linear-gradient(135deg, #7f7fd5 1%,rgb(255, 255, 255) 99%);
  background: #fff;
  background: #fafafa;
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
  all:unset;
  padding: 8px 12px;
  border-radius: 8px;
  background: #6c63ff;
  color: #fff;
  border: none;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    
    color:rgb(162, 158, 245);
    background:rgb(211, 209, 250);
  color: #6c63ff;
  }
`;

const RecommendList = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0 0 0;
`;

const RecommendCard = styled.div`
  min-width: 120px;
  max-width: 140px;
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
  const [showShare, setShowShare] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true); // 추가: 전체화면 여부

  const [animating, setAnimating] = useState(false);
  const topBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const router = useRouter();
  // DB에서 like, comment, liked(내가 누른적 있는지) 불러오기
  useEffect(() => {
    setIsClient(true);
    if (!test?.id) return;
    //카톡 공유 api 신청해야함
    // if (typeof window !== 'undefined') {
    //   const checkKakao = setInterval(() => {
    //     if (window.Kakao && window.Kakao.init && !window.Kakao.isInitialized()) {
    //       window.Kakao.init('여기에_본인_카카오_JavaScript_키');
    //       clearInterval(checkKakao);
    //     }
    //   }, 100);
    //   return () => clearInterval(checkKakao);
    // }


    const userKey = getUserKey();
    // 테스트 정보(좋아요, 내가 누른적 있는지, 댓글 수 등)
    axios.get(`https://smartpick.website/api/tests/${test.id}`, { headers: { 'x-user-key': userKey } })
      .then(res => {
        setLikeCount(res.data.likes || 0);
        setLiked(Boolean(res.data.userLiked));
      });
    // 댓글 목록
    axios.get(`https://smartpick.website/api/tests/${test.id}/comments`)
      .then(res => {
        setComments(res.data.comments || []);
        setCommentCount((res.data.comments || []).length);
        console.log('commentCount', commentCount);
      }
      );
    // 추천 테스트
    axios.get(`https://smartpick.website/api/tests/${test.id}/recommends`)
      .then(res => setRecommendTests(res.data || []))
      .catch(() => setRecommendTests([]));

    // 추가: 주소창 유무 감지
    const handleResize = () => {
      const vh = window.innerHeight;
      const vvh = window.visualViewport ? window.visualViewport.height : vh;
      setIsFullScreen(Math.abs(vh - vvh) < 20); // 20px 이하 차이면 fullscreen
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [test?.id]);

  // 좋아요
  const handleLike = async () => {
    if (!test?.id) return;
    const userKey = getUserKey();
    try {
      const res = await axios.post(`https://smartpick.website/api/tests/${test.id}/like`, {}, { headers: { 'x-user-key': userKey } });
      setLiked(res.data.liked);
      setAnimating(true)
      setTimeout(() => setAnimating(false), 1000);
      if (typeof res.data.likes === 'number') setLikeCount(res.data.likes);
      else setLikeCount(liked ? Math.max(likeCount - 1, 0) : likeCount + 1);
    } catch (e) {
      // 실패 시 무시
    }
  };


  // 댓글
  const handleComment = () => setShowComment(true) || setShowDetail(false);
  const closeCommentModal = () => setShowComment(false);
  const submitComment = async () => {
    if (!newComment.nickname || !newComment.content || !newComment.password || !test?.id) return;
    if (newComment.password.length < 4) {
      toast.error('비밀번호는 4글자 이상이어야 합니다.');
      return;
    }
    const userKey = getUserKey();
    try {
      await axios.post(`https://smartpick.website/api/tests/${test.id}/comments`, {
        nickname: newComment.nickname,
        content: newComment.content,
        password: newComment.password,
      }, { headers: { 'x-user-key': userKey } });
      // 댓글 목록을 즉시 다시 불러와서 갱신
      const res2 = await axios.get(`https://smartpick.website/api/tests/${test.id}/comments`);
      setComments(res2.data.comments || []);
      setCommentCount((res2.data.comments || []).length);
      console.log('commentcount', commentCount);
      setNewComment({ nickname: '', content: '', password: '' });
    } catch (e) {
      // 실패 시 무시
    }
  };

  // 상세
  const handleDetail = () => setShowDetail(true);
  const closeDetailModal = () => setShowDetail(false);

  const handleShare = () => setShowShare(true);
  const closeShareModal = () => setShowShare(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = test?.title || '심리테스트 결과 공유';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('URL이 복사되었습니다!');
    } catch {
      toast.error('복사 실패!');
    }
  };

  const handleKakaoShare = () => {
    console.log(window.Kakao, window.Kakao.Share);
    console.info('test.thumbnail:' , test.thumbnail);
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init('74fb3033cd26d246d32ee28d6ea4586f');
    }
    if (window.Kakao && window.Kakao.Share) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: shareTitle,
          description: '재미있는 심리테스트 결과를 공유해보세요!',
          imageUrl: test?.thumbnail ? (test.thumbnail.startsWith('http') ? test.thumbnail : `https://smartpick.website${test.thumbnail}`) : '',
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [
          { title: '결과 보기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }
        ]
      });
    } else {
      toast.info('카카오톡 공유를 사용할 수 없습니다.');
    }
  };

  function ResultPage({ test, shareUrl, shareTitle }) {
    const handleFacebookShare = () => {
      if (!shareUrl) {
        toast.info('공유할 URL이 없습니다.');
        return;
      }
  
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  
      const width = 500;
      const height = 500;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
  
      window.open(
        facebookShareUrl,
        '_blank',
        `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
      );
    };
  
    return (
      <>
        <Head>
          {/* Open Graph 메타 태그 */}
          
          <meta property="og:description" content="재미있는 심리테스트를 공유해보세요!" />
          <meta
            property="og:image"
            content={
              test?.thumbnail?.startsWith('http')
                ? test.thumbnail
                : `https://smartpick.website${test.thumbnail}`
            }
          />
          <meta property="og:url" content={window.location.href} />
        </Head>
  
        <main>
          <h1>{shareTitle}</h1>
          <button onClick={handleFacebookShare}>페이스북 공유</button>
        </main>
      </>
    );
  }
  const handleFacebookShare = () => {
    try {
      if (!shareUrl) {
        toast.info('공유할 URL이 없습니다.');
        return;
      }
  
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  
      console.info('Facebook 공유');
      console.info('test.thumbnail:' , test.thumbnail);
      // 팝업을 화면 중앙에 띄우기
      const width = 500;
      const height = 500;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
  
      window.open(
        facebookShareUrl,
        '_blank',
        `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
      );
    } catch (error) {
      console.error('Facebook 공유 오류:', error);
      toast.info('페이스북 공유를 사용할 수 없습니다.');
    }
  };
//"/assets/start-images/ko_start.png"

async function getServerdSideProps(context) {
  const { id } = context.params;

  // 테스트 데이터 가져오기
  const test = await fetchTestDataById(id);

  // SSR 시점에서 정확한 URL 만들어서 전달
  const shareUrl = `https://smartpick.website/result/${id}`;

  return {
    props: {
      test,
      shareUrl,
    },
  };
}
  const handleFacebookShare1 = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=500,height=500');
  };
  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank', 'width=500,height=400');
  };

  const ShareModalOverlay = styled.div`
    position: fixed;
    left: 0; right: 0; top: 0; bottom: 0;
    background: rgba(0,0,0,0.2);
    z-index: 100;
    display: ${({ open }) => (open ? 'block' : 'none')};
  `;
  const ShareModal = styled.div`
    position: fixed;
    left: 50%;
    bottom: 90px;
    transform: translateX(-50%) scale(${({ open }) => (open ? 1 : 0.7)});
    opacity: ${({ open }) => (open ? 1 : 0)};
    
    height: ${({ open }) => (open ? 'none' : 0)};
    transition: all 0.25s cubic-bezier(.4,0,.2,1);
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.18);
    padding: 18px 20px 12px 20px;
    z-index: 200;
    min-width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;
  const ShareButtonRow = styled.div`
    display: flex;
    gap: 18px;
    margin-top: 6px;
  `;
  const RoundShareButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background:rgb(233, 230, 230);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  color: #888; /* 기본 아이콘 색상 */
  &:hover {
    background:rgb(230, 215, 240);
    color: #6c63ff; /* 호버 시 아이콘 색상 */
  }
    
    svg {
    background: inherit !important; /* 반드시 inherit로! */
    width: 28px !important;
    height: 28px !important;
    min-width: 28px;
    min-height: 28px;
    max-width: 28px;
    max-height: 28px;
    display: block;
     &:hover {
    background: #e0e0e0;
    color: #6c63ff; /* 호버 시 아이콘 색상 */
  }
`;

  return (
    <Div100vh
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 500,
        marginTop: TOPBAR_HEIGHT,
        margin: '0 auto',
        background: '#fff',
      }}
    > <Head>
        {/* ...기존... */}
        <script src="https://developers.kakao.com/sdk/js/kakao.min.js"></script>
      </Head>
      <TopBar
        ref={topBarRef}
        style={{
          height: TOPBAR_HEIGHT,
          flexShrink: 0,
          position: 'fixed',
          left: 0,
          right: 0,
          top: 0, // JS에서 동적으로 덮어씀
          zIndex: 10,
        }}
      >
        <Logo
          onClick={() => {
            window.location.href = '/'
          }}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            zIndex: 2,
            display: 'flex',
            gap: 8
          }}
        >

          <span style={{
            marginRight: -10, marginTop: 0
          }}>심</span>
          <Image src="/uploads/logo.png" alt="심풀 로고"
            layout="fixed" width={35} height={35} style={{
              marginTop: -5
            }} />
          <span style={{
            marginLeft: -10, marginTop: 0
          }}>풀</span>
        </Logo>
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
          <IframeSection
            src={src}
            allowFullScreen
            style={{
              paddingTop: TOPBAR_HEIGHT,
            }}
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
        ref={bottomBarRef}
        style={{
          height: BOTTOMBAR_HEIGHT,
          flexShrink: 0,
          position: 'fixed',
          left: 0,
          right: 0,
          // top: JS에서 동적으로 덮어씀
          zIndex: 10,
          width: '100%',
          paddingBottom: 'env(safe-area-inset-bottom)',
          marginBottom: 0,
          transition: 'top 0.2s',
        }}
      >
        <ActionWrap>
          <ButtonWrapper onClick={handleLike}>
            {/* 하얀 하트 */}
            {!liked && (
              <motion.div
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <HeartWrapper>
                  <Image src="/uploads/heart_white.png" alt="빈하트" width={20} height={20} />
                </HeartWrapper>
              </motion.div>
            )}
            {liked && (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 0 }}
                transition={{ duration: 0.4 }}
              >
                <HeartWrapper>
                  <Image src="/uploads/heart_white.png" alt="빈하트" width={20} height={20} />
                </HeartWrapper>
              </motion.div>
            )}

            {/* 빨간 하트 */}
            {liked && (

              <motion.div
                as={motion.div}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}

                top='-50%'
                left='-50%'

              >

                <HeartWrapper>
                  <Image src="/uploads/heart.png" alt="좋아요" width={20} height={20} />
                </HeartWrapper>
              </motion.div>
            )}

            {/* 빨간 원 */}
            <AnimatePresence>
              {animating && liked && (
                <motion.div
                  as={motion.div}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <RedCircle
                  /></motion.div>
              )}
            </AnimatePresence>

            {/* 물방울 */}
            {animating && liked &&
              ['-1,-1.2', '1.2,-1', '-1.2,1', '1,1.2'].map((pos, i) => {
                const [x, y] = pos.split(',').map(Number);

                return (
                  <> <motion.div
                    as={motion.div}
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                    animate={{ x: x * 15, y: y * 15, opacity: 0.5, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    <Bubble></Bubble>
                  </motion.div>
                    <motion.div
                      as={motion.div}
                      key={i}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0.3 }}
                      animate={{ x: x * 15 * 0.8, y: y * 15 * 1.2, opacity: 0.5, scale: 0.7 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                      <Bubble></Bubble>
                    </motion.div>
                  </>
                );
              })}
          </ButtonWrapper>
          <ActionCount>{likeCount}</ActionCount>
        </ActionWrap>
        <ActionWrap>
          <ButtonWrapper onClick={handleComment}><FaComment></FaComment></ButtonWrapper>
          <ActionCount></ActionCount>
        </ActionWrap>
        <ActionWrap>
          <ButtonWrapper onClick={handleShare}><FaShareSquare></FaShareSquare></ButtonWrapper>
          <ActionCount></ActionCount>
        </ActionWrap>
        <ActionWrap>
          <ButtonWrapper onClick={handleDetail}><FaInfoCircle></FaInfoCircle></ButtonWrapper>
        </ActionWrap>
      </BottomBar>
      {/* 댓글 모달 */}
      <ModalOverlay open={showComment} onClick={closeCommentModal} />
      <ModalSheet open={showComment}>
        <ModalHeader>
          댓글 ({commentCount})
          <ButtonWrapper
            onClick={closeCommentModal}
          ><FaChevronDown /></ButtonWrapper>
        </ModalHeader>
        <ModalBody>
          <div>
            {comments.map((c, i) => (
              <div
                key={i}
                style={{
                  borderBottom: '1px solid #eee',
                  padding: '8px 0',
                  textAlign: 'left', // ✅ 핵심
                }}
              >
                <div style={{ marginBottom: 4 }}>
                  <b>{c.nickname}</b>{' '}
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>
                  {c.content}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'20px', }}>
            <div style={{ width: '100%', marginBottom: 8, display: 'flex',  }}>
              <input style={{ height: 30, flex:0.8, border: '1px solid #ccc', minWidth: 0 }} placeholder="닉네임" value={newComment.nickname} onChange={e => setNewComment({ ...newComment, nickname: e.target.value })} />
              <input style={{ height: 30, flex:0.8, border: '1px solid #ccc', minWidth: 0}} placeholder="비밀번호" type="password" value={newComment.password} onChange={e => setNewComment({ ...newComment, password: e.target.value })} />
            </div>
            <textarea style={{
              fontFamily: 'inherit', fontSize: 'inherit', width: '100%',
              marginBottom: 8, height: 80, resize: 'none', overflowY: 'auto', lineHeight: '1.4', fontSize: 14, border: '1px solid #ccc', borderRadius: 4,
            }}
              rows={3} placeholder="댓글을 입력하세요" value={newComment.content} onChange={e => setNewComment({ ...newComment, content: e.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', }}>
              <CommentButton onClick={submitComment} style={{ right: '5px', marginBottom: 16 }}>댓글 작성</CommentButton>
            </div>
          </div>
        </ModalBody>
      </ModalSheet>
      {/* 상세 모달 */}
      <ModalOverlay open={showDetail} onClick={closeDetailModal} />
      <ModalSheet open={showDetail}>
        <ModalHeader style={{
          position: 'relative',
          padding: '12px 16px',
          width: '100%',
          flexShrink: '0',
          display: 'flex',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          boxSizing: 'border-box',
        }}>
          { /* 상세도 같이 추가 */}
          <ActionWrap>
            <ButtonWrapper onClick={handleLike}>
              {/* 하얀 하트 */}
              {!liked && (
                <motion.div
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <HeartWrapper>
                    <Image src="/uploads/heart_white.png" alt="빈하트" width={25} height={25} />
                  </HeartWrapper>
                </motion.div>
              )}
              {liked && (
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <HeartWrapper>
                    <Image src="/uploads/heart_white.png" alt="빈하트" width={25} height={25} />
                  </HeartWrapper>
                </motion.div>
              )}

              {/* 빨간 하트 */}
              {liked && (

                <motion.div
                  as={motion.div}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}

                  top='-50%'
                  left='-50%'

                >

                  <HeartWrapper>
                    <Image src="/uploads/heart.png" alt="좋아요" width={25} height={25} />
                  </HeartWrapper>
                </motion.div>
              )}

              {/* 빨간 원 */}
              <AnimatePresence>
                {animating && liked && (
                  <motion.div
                    as={motion.div}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    <RedCircle
                    /></motion.div>
                )}
              </AnimatePresence>

              {/* 물방울 */}
              {animating && liked &&
                ['-1,-1.2', '1.2,-1', '-1.2,1', '1,1.2'].map((pos, i) => {
                  const [x, y] = pos.split(',').map(Number);

                  return (
                    <> <motion.div
                      as={motion.div}
                      key={i}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                      animate={{ x: x * 15, y: y * 15, opacity: 0.5, scale: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                      <Bubble></Bubble>
                    </motion.div>
                      <motion.div
                        as={motion.div}
                        key={i}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 0.3 }}
                        animate={{ x: x * 15 * 0.8, y: y * 15 * 1.2, opacity: 0.5, scale: 0.7 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      >
                        <Bubble></Bubble>
                      </motion.div>
                    </>
                  );
                })}
            </ButtonWrapper>
            <ActionCount>{likeCount}</ActionCount>
          </ActionWrap>
          <ActionWrap>
            <ButtonWrapper onClick={handleComment}><FaComment></FaComment></ButtonWrapper>
            <ActionCount>{commentCount}</ActionCount>
          </ActionWrap>
          <ActionWrap>
            <ButtonWrapper onClick={handleShare}><FaShareSquare></FaShareSquare></ButtonWrapper>
            <ActionCount>{shareCount}</ActionCount>
          </ActionWrap>
          <ActionWrap>
            <ButtonWrapper
              onClick={closeDetailModal}
            ><FaChevronDown /></ButtonWrapper>
          </ActionWrap>
        </ModalHeader>
        <ModalBody>
          <div style={{ color: '#000000', fontWeight: 'bold', fontSize: '1.3rem', marginBottom: 8 }}>{test?.title || '테스트'}</div>
          <div style={{ color: '#0e0e0e', marginBottom: 16 }}>{test?.description || '테스트 설명'}</div>

          {/* 추천 테스트 카드 리스트 */}
          <div style={{ marginLeft: '2vw', color: '#0e0e0e', display: 'flex', justifyContent: 'flex-start', }}>
            <FaThumbsUp style={{ marginTop: '5px', marginRight: '2px', fontSize: '0.9rem' }} />
            추천해요
          </div>
          <ScrollListSection
            sortedTests={recommendTests}
            getImagePath={getImagePath}
          />

        </ModalBody>
      </ModalSheet>
      {/* 공유 모달 */}
      <ShareModalOverlay open={showShare} onClick={closeShareModal} />
      <ShareModal open={showShare}>
        <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 8 }}>공유하기</div>
        <ShareButtonRow>
          <RoundShareButton onClick={handleCopyUrl} title="URL 복사"><FaLink color='rgb(46, 44, 32)' size={28} /></RoundShareButton>
         {/**/}
          <RoundShareButton onClick={handleKakaoShare} title="카카오톡">
            <SiKakaotalk color='rgb(46, 26, 10)' width='25px' size={28} />
          </RoundShareButton>
          <RoundShareButton onClick={handleFacebookShare} title="페이스북"><FaFacebook color="#1877f3" size={28} /></RoundShareButton>
          <RoundShareButton onClick={handleTwitterShare} title="트위터"><FaTwitterSquare color="#1da1f2" size={28} /></RoundShareButton>
          
        </ShareButtonRow>
      </ShareModal>
    </Div100vh>
  );
}