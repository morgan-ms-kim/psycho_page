import React, { useState } from 'react';
import { useTestContext } from './mobiletest';

export default function TestSample() {
  const { user, comments, likes, addComment, like, saveResult } = useTestContext();
  const [result, setResult] = useState('');
  const [comment, setComment] = useState('');

  return (
    <div style={{ padding: 24 }}>
      <h2>샘플 심리테스트</h2>
      <div>
        <button onClick={() => setResult('A형')}>A형 결과</button>
        <button onClick={() => setResult('B형')}>B형 결과</button>
        <button onClick={() => result && saveResult(result)} disabled={!result}>
          결과 저장
        </button>
      </div>
      <div style={{ margin: '16px 0' }}>
        <button onClick={like}>좋아요({likes})</button>
      </div>
      <div>
        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="댓글 입력" />
        <button onClick={() => { addComment({ text: comment }); setComment(''); }} disabled={!comment}>
          댓글 추가
        </button>
      </div>
      <div style={{ marginTop: 16 }}>
        <h4>댓글 목록</h4>
        {comments.map((c, i) => <div key={i}>{c.text}</div>)}
      </div>
      <div style={{ marginTop: 16 }}>
        <b>로그인 상태:</b> {user ? user.name : '로그인 필요'}
      </div>
    </div>
  );
} 