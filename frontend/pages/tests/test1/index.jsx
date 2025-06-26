import { useState } from 'react';
import styled from 'styled-components';

export default function Test1() {
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, nickname: '익명1', content: '재밌어요!', likes: 2 },
    { id: 2, nickname: '익명2', content: '완전 신기함', likes: 1 },
  ]);
  const [comment, setComment] = useState('');

  return (
    <Wrap>
      <Title>🍭 테스트1: 나의 오락실 캐릭터 유형은?</Title>
      <AdBox>광고 영역</AdBox>
      <Desc>레트로 오락실 감성으로 알아보는 나만의 캐릭터!<br/>아래 시작하기 버튼을 눌러 테스트를 진행해보세요.</Desc>
      <BtnRow>
        <Button onClick={() => alert('테스트 시작!')}>시작하기</Button>
        <Button onClick={() => setLiked(l => !l)}>{liked ? '❤️' : '🤍'} 좋아요</Button>
        <Button onClick={() => alert('공유하기!')}>🔗 공유하기</Button>
      </BtnRow>
      <SectionTitle>댓글</SectionTitle>
      <CommentList>
        {comments.map(c => (
          <CommentItem key={c.id}>
            <b>{c.nickname}</b> {c.content}
            <LikeBtn onClick={() => {
              setComments(cs => cs.map(x => x.id === c.id ? { ...x, likes: x.likes + 1 } : x));
            }}>👍 {c.likes}</LikeBtn>
          </CommentItem>
        ))}
      </CommentList>
      <CommentForm onSubmit={e => {
        e.preventDefault();
        if (!comment.trim()) return;
        setComments(cs => [...cs, { id: Date.now(), nickname: '익명', content: comment, likes: 0 }]);
        setComment('');
      }}>
        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="댓글을 입력하세요" />
        <Button type="submit">등록</Button>
      </CommentForm>
    </Wrap>
  );
}

const Wrap = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 8px;
`;
const Title = styled.h1`
  font-size: 2rem;
  color: #ff5e5e;
  text-align: center;
  margin-bottom: 16px;
`;
const AdBox = styled.div`
  background: #ffe066;
  color: #6c63ff;
  border-radius: 16px;
  text-align: center;
  padding: 16px;
  margin-bottom: 24px;
  font-weight: bold;
`;
const Desc = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 24px;
`;
const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
`;
const Button = styled.button``;
const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: #6c63ff;
  margin-bottom: 8px;
`;
const CommentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
`;
const CommentItem = styled.li`
  background: #fffbe7;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const LikeBtn = styled.button`
  background: none;
  color: #ff5e5e;
  font-size: 1rem;
  margin-left: 8px;
`;
const CommentForm = styled.form`
  display: flex;
  gap: 8px;
  input {
    flex: 1;
    border-radius: 8px;
    border: 1px solid #ffe066;
    padding: 8px 12px;
    font-size: 1rem;
  }
`; 