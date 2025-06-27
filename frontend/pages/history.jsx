import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

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
    router.push(`/psycho_page/tests/${testId}`);
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
        <BackButton onClick={() => router.push('/psycho_page')}>
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
          <StartButton onClick={() => router.push('/psycho_page')}>
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
                    <ResultImage src={result.result.image} alt={result.result.title} />
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
      </Footer>
    </MainWrap>
  );
}

// 스타일 컴포넌트들
const MainWrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  text-align: center;
  flex: 1;
`;

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

const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
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
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
`;

const StartButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ffa500);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }
`;

const ResultsContainer = styled.div`
  padding: 2rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
`;

const ResultsCount = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const ResultsDate = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ResultCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const TestTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #ffd700;
`;

const ResultDate = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`;

const ResultContent = styled.div`
  margin-bottom: 1.5rem;
`;

const ResultTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: #ff6b6b;
`;

const ResultDescription = styled.p`
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
`;

const ResultImage = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 10px;
  margin-top: 1rem;
`;

const ResultActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const RetakeButton = styled.button`
  background: linear-gradient(45deg, #4CAF50, #45a049);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: linear-gradient(45deg, #45a049, #4CAF50);
  }
`;

const DeleteButton = styled.button`
  background: rgba(255, 0, 0, 0.3);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(255, 0, 0, 0.4);
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`; 