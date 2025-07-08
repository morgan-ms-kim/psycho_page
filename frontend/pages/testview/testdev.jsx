import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState } from 'react';
import MobileTestFrame from './tests/mobiletest';

// 테스트 목록(자동화 가능, 일단 수동 배열)
const TEST_LIST = [
  { id: '../../../public/tests/template78/src/App.js', name: '샘플 심리테스트' },
  { id: 'tests/elite-quiz2/src/App', name: '엘리트 퀴즈2' },
  // { id: 'tests/test1', name: '테스트1' },
  // { id: 'tests/test2', name: '테스트2' },
];

export default function TestDevPage() {
  const router = useRouter();
  const { testId } = router.query;
  const [selected, setSelected] = useState(testId || '');

  // 동적 import (SSR 비활성화)
  const TestComponent =  dynamic(() => import(`./${selected}`), { ssr: false, loading: () => <div>로딩 중...</div> })


  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
      <h2>테스트 개발/미리보기</h2>
      <div style={{ marginBottom: 16 }}>
        <select
          value={selected}
          onChange={e => {
            setSelected(e.target.value);
            router.replace({ pathname: router.pathname, query: { testId: e.target.value } }, undefined, { shallow: true });
          }}
        >
          <option value="">테스트를 선택하세요</option>
          {TEST_LIST.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      {selected && TestComponent ? (
        <MobileTestFrame TestComponent={TestComponent} testId={selected} />
      ) : (
        <div style={{ color: '#888' }}>테스트를 선택하면 미리보기가 나옵니다.</div>
      )}
    </div>
  );
} 