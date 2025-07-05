import React, { useState } from 'react';
import { useTestContext } from './context/TestContext';

export default function TestSample() {
  const { user } = useTestContext();  // TestContext에서 user 정보를 가져옴
  const [result, setResult] = useState('');  // 결과 상태
  const [comment, setComment] = useState('');  // 댓글 상태

  const handleSaveResult = () => {
    if (!result) return;  // 결과가 없으면 저장하지 않음
    // 여기서 서버로 결과를 보내거나, 로컬에 저장하는 등의 처리 로직을 추가할 수 있음
    alert(`결과가 저장되었습니다: ${result}`);
  };

  const handleAddComment = () => {
    if (!comment) return;  // 댓글이 없으면 추가하지 않음
    // 여기서 서버로 댓글을 추가하거나, 댓글 목록에 추가하는 로직을 작성할 수 있음
    alert(`댓글 추가: ${comment}`);
    setComment('');  // 댓글 추가 후 입력란 초기화
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>샘플 심리테스트</h2>

      {/* 테스트 결과 버튼 */}
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => setResult('A형')} disabled={result === 'A형'}>A형 결과</button>
        <button onClick={() => setResult('B형')} disabled={result === 'B형'}>B형 결과</button>
        <button onClick={handleSaveResult} disabled={!result}>
          결과 저장
        </button>
      </div>

      {/* 좋아요 버튼 */}
      <div style={{ margin: '16px 0' }}>
        <button onClick={() => alert('좋아요!')}>좋아요</button>
      </div>

      {/* 댓글 입력 */}
      <div style={{ marginTop: 16 }}>
        <input
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="댓글을 입력하세요"
          style={{ padding: '8px', width: '100%', marginBottom: '8px' }}
        />
        <button onClick={handleAddComment} disabled={!comment} style={{ padding: '8px 16px' }}>
          댓글 추가
        </button>
      </div>

      {/* 로그인 상태 표시 */}
      <div style={{ marginTop: 16 }}>
        <b>로그인 상태:</b> {user ? user.name : '로그인 필요'}
      </div>
    </div>
  );
}
