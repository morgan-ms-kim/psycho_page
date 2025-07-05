// pages/testview/tests/TestSample.js
import React, { useState } from 'react';
import { useTestContext } from '/components/context/TestContext';

export default function TestSample() {
  const { user } = useTestContext(); // TestContext에서 user 정보를 가져옴
  const [result, setResult] = useState('');
  const [comment, setComment] = useState('');

  const handleSaveResult = () => {
    if (!result) return;  // 결과가 없으면 저장하지 않음
    alert(`결과가 저장되었습니다: ${result}`);
  };

  const handleAddComment = () => {
    if (!comment) return;  // 댓글이 없으면 추가하지 않음
    alert(`댓글 추가: ${comment}`);
    setComment('');  // 댓글 추가 후 입력란 초기화
  };

  return (
    <TestProvider>
    <div style={{ padding: 24 }}>
      <h2>샘플 심리테스트</h2>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => setResult('A형')} disabled={result === 'A형'}>A형 결과</button>
        <button onClick={() => setResult('B형')} disabled={result === 'B형'}>B형 결과</button>
        <button onClick={handleSaveResult} disabled={!result}>결과 저장</button>
      </div>
      <div style={{ margin: '16px 0' }}>
        <button onClick={() => alert('좋아요!')}>좋아요</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <input
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="댓글을 입력하세요"
          style={{ padding: '8px', width: '100%', marginBottom: '8px' }}
        />
        <button onClick={handleAddComment} disabled={!comment} style={{ padding: '8px 16px' }}>댓글 추가</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <b>로그인 상태:</b> {user ? user.name : '로그인 필요'}
      </div>
    </div>
    </TestProvider>
  );
}
