import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import {
  MainWrap,
  Header,
  BackButton,
  LoadingWrap,
  LoadingSpinner,
  Footer,
  PrimaryButton,
  SecondaryButton,
  Card,
  FlexRow,
  Section,
  Title
} from '../components/StyledComponents';
import Image from 'next/image';

export default function History() {
  const router = useRouter();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = () => {
    try {
      const savedResults = JSON.parse(localStorage.getItem('testResults') || '[]');
      setTestResults(savedResults);
      setLoading(false);
    } catch (error) {
      console.error('테스트 결과 로드 실패:', error);
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm('모든 테스트 기록을 삭제하시겠습니까?')) {
      localStorage.removeItem('testResults');
      setTestResults([]);
    }
  };

  const deleteResult = (index) => {
    const newResults = testResults.filter((_, i) => i !== index);
    localStorage.setItem('testResults', JSON.stringify(newResults));
    setTestResults(newResults);
  };

  const retakeTest = (testId) => {
    router.push(`/testview/${testId}`);
  };

  if (loading) {
    return (
      <LoadingWrap>
        <LoadingSpinner />
        <p>테스트 기록을 불러오는 중...</p>
      </LoadingWrap>
    );
  }

  return (
    <MainWrap>
      {/* 헤더 */}
      <Header>
        <BackButton onClick={() => router.push('/')}>
          ← 메인으로
        </BackButton>
        <PageTitle>📋 테스트 기록</PageTitle>
        <ClearButton onClick={clearHistory}>
          전체 삭제
        </ClearButton>
      </Header>

      {/* 결과 없음 */}
      {testResults.length === 0 && (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyTitle>아직 완료한 테스트가 없습니다</EmptyTitle>
          <EmptyDesc>테스트를 완료하면 여기에 결과가 저장됩니다.</EmptyDesc>
          <StartButton onClick={() => router.push('/')}>
            테스트 시작하기
          </StartButton>
        </EmptyState>
      )}

      {/* 결과 목록 */}
      {testResults.length > 0 && (
        <ResultsContainer>
          <ResultsHeader>
            <ResultsCount>총 {testResults.length}개의 테스트 완료</ResultsCount>
            <ResultsDate>최근 완료: {new Date(testResults[0]?.completedAt).toLocaleDateString()}</ResultsDate>
          </ResultsHeader>

          <ResultsList>
            {testResults.map((result, index) => (
              <ResultCard key={index}>
                <ResultHeader>
                  <TestTitle>{result.testTitle}</TestTitle>
                  <ResultDate>{new Date(result.completedAt).toLocaleDateString()}</ResultDate>
                </ResultHeader>
                
                <ResultContent>
                  <ResultTitle>{result.result.title}</ResultTitle>
                  <ResultDescription>{result.result.description}</ResultDescription>
                  {result.result.image && (
                    <Image
                      src={result.result.image}
                      width={150}
                      height={150}
                      alt={result.result.title}
                      style={{ width: '100%', maxWidth: '500px', minWidth: '360px', height: 'auto' }}
                    />
                  )}
                </ResultContent>

                <ResultActions>
                  <RetakeButton onClick={() => retakeTest(result.testId)}>
                    🔄 다시 테스트하기
                  </RetakeButton>
                  <DeleteButton onClick={() => deleteResult(index)}>
                    🗑️ 삭제
                  </DeleteButton>
                </ResultActions>
              </ResultCard>
            ))}
          </ResultsList>
        </ResultsContainer>
      )}

      {/* 푸터 */}
      <Footer>
        <p>© 2024 PSYCHO - 재미있는 심리테스트 모음</p>
        <div id="kakao-ad-container"></div>
      </Footer>


    </MainWrap>
  );
}

// 스타일 컴포넌트들 (페이지 전용)
const PageTitle = styled(Title)``;

const ClearButton = styled.button`
  background: rgba(255, 0, 0, 0.3);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: rgba(255, 0, 0, 0.4);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const EmptyDesc = styled.p`
  opacity: 0.8;
  margin-bottom: 2rem;
`;

const StartButton = styled(PrimaryButton)``;

const ResultsContainer = styled.div`
  padding: 2rem;
`;

const ResultsHeader = styled(FlexRow)`
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
`;

const ResultsCount = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

const ResultsDate = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ResultCard = styled(Card)`
  border-radius: 15px;
`;

const ResultHeader = styled(FlexRow)`
  margin-bottom: 1rem;
`;

const TestTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0;
`;

const ResultDate = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
`;

const ResultContent = styled.div`
  margin-bottom: 1.5rem;
`;

const ResultTitle = styled.h4`
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
  color: #ffa500;
`;

const ResultDescription = styled.p`
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const ResultImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 10px;
  object-fit: cover;
`;

const ResultActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const RetakeButton = styled(PrimaryButton)``;

const DeleteButton = styled.button`
  background: rgba(255, 0, 0, 0.3);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background: rgba(255, 0, 0, 0.4);
  }
`; 