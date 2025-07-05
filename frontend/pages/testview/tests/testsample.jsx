import React, { useState } from 'react';
import { useTestContext } from './context/TestContext';

export default function TestSample() {
  const { user } = useTestContext();
  const [result, setResult] = useState('');
  const [comment, setComment] = useState('');

  const handleSaveResult = () => {
    if (!result) return;
    alert(`결과 저장: ${result}`);
  };

  const handleAddComment = () => {
    if (!comment) return;
    alert(`댓글 추가: ${comment}`);
    setComment('');
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>샘플 심리테스트</h2>
      <div>
        <button onClick={() => setResult('A형')}>A형 결과</button>
        <button onClick={() => setResult('B형')}>B형 결과</button>
        <button onClick={handleSaveResult} disabled={!result}>
          결과 저장
        </button>
      </div>
      <div style={{ margin: '16px 0' }}>
        <button onClick={() => alert('좋아요!')}>좋아요</button>
      </div>
      <div>
        <input 
          value={comment} 
          onChange={e => setComment(e.target.value)} 
          placeholder="댓글 입력" 
        />
        <button onClick={handleAddComment} disabled={!comment}>
          댓글 추가
        </button>
      </div>
      <div style={{ marginTop: 16 }}>
        <b>로그인 상태:</b> {user ? user.name : '로그인 필요'}
      </div>
    </div>
  );
} 