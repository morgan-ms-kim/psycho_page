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
`;
const Banner = styled.img`
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  margin-bottom: 24px;
`;
const Title = styled.h1`
  font-size: 2rem;
  color: #ff5e5e;
  margin-bottom: 12px;
`;
const Desc = styled.p`
  font-size: 1.1rem;
  margin-bottom: 24px;
`;
const Button = styled.button`
  margin-top: 16px;
`;
const QTitle = styled.h2`
  font-size: 1.3rem;
  color: #6c63ff;
  margin-bottom: 16px;
`;
const AnsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const AnsBtn = styled.button`
  background: #ffe066;
  color: #222;
  font-size: 1.1rem;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px #ffb3e633;
  &:hover {
    background: #ffb3e6;
    color: #6c63ff;
  }
`;
const ResultBox = styled.div`
  background: #fffbe7;
  border-radius: 16px;
  padding: 32px 12px;
  margin-top: 24px;
`; 