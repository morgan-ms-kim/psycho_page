import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import MobileTestFrame from './tests/mobiletest';

export default function TestDevPage() {
  const router = useRouter();
  const { testId } = router.query;

  // 동적 import (SSR 비활성화)
  const TestComponent = testId
    ? dynamic(() => import(`./${testId}`), { ssr: false })
    : null;

  if (!testId) return <div>testId 쿼리 파라미터를 입력하세요.</div>;
  if (!TestComponent) return <div>테스트 컴포넌트를 찾을 수 없습니다.</div>;

  return <MobileTestFrame TestComponent={TestComponent} testId={testId} />;
} 