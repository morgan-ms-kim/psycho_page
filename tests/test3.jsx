import { useState } from 'react';
import styled from 'styled-components';
import testData from './test3/test.json';

export default function Test3() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleAnswer = idx => {
    setAnswers([...answers, idx]);
    setStep(step + 1);
  };

  const getResult = () => {
    const resultIdx = answers.reduce((a, b) => a + b, 0) % testData.results.length;
    return testData.results[resultIdx];
  };

  return (
    <Wrap>
      {step === 0 && (
        <>
          <Banner src={`/tests/test3/${testData.banner}`} alt="배너" />
          <Title>{testData.title}</Title>
          <Desc>{testData.description}</Desc>
          <Button onClick={() => setStep(1)}>시작하기</Button>
        </>
      )}
      {step > 0 && step <= testData.questions.length && (
        <>
          <QTitle>Q{step}. {testData.questions[step - 1].q}</QTitle>
          <AnsList>
            {testData.questions[step - 1].a.map((a, i) => (
              <AnsBtn key={i} onClick={() => handleAnswer(i)}>{a}</AnsBtn>
            ))}
          </AnsList>
        </>
      )}
      {step > testData.questions.length && (
        <ResultBox>
          <h2>결과: {getResult().title}</h2>
          <p>{getResult().desc}</p>
          <Button onClick={() => { setStep(0); setAnswers([]); }}>다시하기</Button>
        </ResultBox>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 32px 8px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Banner = styled.img`
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #ffa500;
  margin-bottom: 12px;
`;

const Desc = styled.p`
  font-size: 1.1rem;
  margin-bottom: 24px;
  opacity: 0.9;
`;

const Button = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ffa500);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }
`;

const QTitle = styled.h2`
  font-size: 1.3rem;
  color: #ffa500;
  margin-bottom: 16px;
`;

const AnsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AnsBtn = styled.button`
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.3);
  color: white;
  font-size: 1.1rem;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255,255,255,0.2);
    border-color: rgba(255,255,255,0.5);
    transform: translateY(-2px);
  }
`;

const ResultBox = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 32px 12px;
  margin-top: 24px;
  backdrop-filter: blur(10px);
  
  h2 {
    color: #ffa500;
    margin-bottom: 16px;
  }
  
  p {
    line-height: 1.6;
    margin-bottom: 24px;
  }
`; 