import React, { useState } from 'react';
import styled from 'styled-components';

const TestContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const QuestionContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const QuestionText = styled.h2`
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 25px;
  text-align: center;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const OptionButton = styled.button`
  background: ${props => props.selected ? '#4CAF50' : '#f8f9fa'};
  color: ${props => props.selected ? 'white' : '#333'};
  border: 2px solid ${props => props.selected ? '#4CAF50' : '#ddd'};
  border-radius: 8px;
  padding: 15px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    background: ${props => props.selected ? '#4CAF50' : '#e9ecef'};
    border-color: #4CAF50;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ResultContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const ResultTitle = styled.h2`
  color: #333;
  font-size: 2rem;
  margin-bottom: 20px;
`;

const ResultDescription = styled.p`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const RestartButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #45a049;
  }
`;

const questions = [
  {
    id: 1,
    text: "새로운 사람들과 만나는 것을 어떻게 생각하시나요?",
    options: [
      { text: "매우 즐겁고 흥미진진하다", score: { E: 2, I: 0 } },
      { text: "좋지만 조금 긴장된다", score: { E: 1, I: 1 } },
      { text: "별로 좋아하지 않는다", score: { E: 0, I: 2 } }
    ]
  },
  {
    id: 2,
    text: "일을 할 때 어떤 방식을 선호하시나요?",
    options: [
      { text: "구체적이고 실용적인 방법", score: { S: 2, N: 0 } },
      { text: "창의적이고 새로운 아이디어", score: { S: 0, N: 2 } },
      { text: "둘 다 적절히 조합한다", score: { S: 1, N: 1 } }
    ]
  },
  {
    id: 3,
    text: "의사결정을 할 때 주로 무엇을 고려하시나요?",
    options: [
      { text: "논리적 분석과 객관적 사실", score: { T: 2, F: 0 } },
      { text: "사람들의 감정과 가치관", score: { T: 0, F: 2 } },
      { text: "상황에 따라 다르다", score: { T: 1, F: 1 } }
    ]
  },
  {
    id: 4,
    text: "일정이나 계획에 대해 어떻게 생각하시나요?",
    options: [
      { text: "체계적이고 계획적인 것을 선호한다", score: { J: 2, P: 0 } },
      { text: "유연하고 즉흥적인 것을 선호한다", score: { J: 0, P: 2 } },
      { text: "상황에 따라 조절한다", score: { J: 1, P: 1 } }
    ]
  },
  {
    id: 5,
    text: "스트레스를 받을 때 어떻게 대처하시나요?",
    options: [
      { text: "혼자만의 시간을 가진다", score: { I: 2, E: 0 } },
      { text: "다른 사람과 이야기한다", score: { I: 0, E: 2 } },
      { text: "활동을 통해 해소한다", score: { I: 1, E: 1 } }
    ]
  },
  {
    id: 6,
    text: "새로운 정보를 받을 때 어떤 것을 선호하시나요?",
    options: [
      { text: "구체적인 예시와 실제 경험", score: { S: 2, N: 0 } },
      { text: "이론적 개념과 미래 가능성", score: { S: 0, N: 2 } },
      { text: "둘 다 균형있게", score: { S: 1, N: 1 } }
    ]
  },
  {
    id: 7,
    text: "갈등 상황에서 어떻게 행동하시나요?",
    options: [
      { text: "직접적으로 문제를 해결하려 한다", score: { T: 2, F: 0 } },
      { text: "관계를 우선시하여 조화를 추구한다", score: { T: 0, F: 2 } },
      { text: "상황에 따라 다르게 접근한다", score: { T: 1, F: 1 } }
    ]
  },
  {
    id: 8,
    text: "일상생활에서 어떤 것을 더 중요하게 생각하시나요?",
    options: [
      { text: "안정성과 예측 가능성", score: { J: 2, P: 0 } },
      { text: "새로운 경험과 변화", score: { J: 0, P: 2 } },
      { text: "적절한 균형", score: { J: 1, P: 1 } }
    ]
  }
];

const personalityTypes = {
  "ISTJ": {
    title: "신중한 관리자",
    description: "체계적이고 책임감이 강하며, 실용적인 문제 해결 능력이 뛰어납니다. 안정적이고 신뢰할 수 있는 성격으로, 규칙과 전통을 중시합니다."
  },
  "ISFJ": {
    title: "온화한 보호자",
    description: "따뜻하고 배려심이 많으며, 다른 사람들을 돌보는 것을 좋아합니다. 충성스럽고 실용적이며, 조용하지만 확실한 방식으로 일을 처리합니다."
  },
  "INFJ": {
    title: "통찰력 있는 이상주의자",
    description: "깊은 통찰력과 창의성을 가지고 있으며, 사람들의 잠재력을 보는 능력이 뛰어납니다. 이상적이고 공감능력이 강하며, 의미 있는 변화를 추구합니다."
  },
  "INTJ": {
    title: "전략적 사상가",
    description: "독창적이고 분석적인 사고를 가지고 있으며, 복잡한 문제를 해결하는 능력이 뛰어납니다. 독립적이고 혁신적이며, 지적 도전을 추구합니다."
  },
  "ISTP": {
    title: "만능 재주꾼",
    description: "실용적이고 논리적이며, 문제 해결 능력이 뛰어납니다. 유연하고 적응력이 강하며, 즉흥적이고 모험을 즐기는 성격입니다."
  },
  "ISFP": {
    title: "예술가형",
    description: "예술적 감각과 실용성을 조화롭게 가지고 있으며, 다른 사람들의 감정에 민감합니다. 평화를 추구하고 충성스럽지만 독립적인 성격입니다."
  },
  "INFP": {
    title: "열정적인 중재자",
    description: "이상적이고 창의적이며, 자신의 가치관에 따라 살아갑니다. 공감능력이 강하고 다른 사람들을 돕는 것을 좋아합니다."
  },
  "INTP": {
    title: "논리적인 사상가",
    description: "논리적이고 분석적인 사고를 가지고 있으며, 복잡한 이론과 시스템을 탐구하는 것을 좋아합니다. 독립적이고 혁신적인 아이디어를 추구합니다."
  },
  "ESTP": {
    title: "모험을 즐기는 사업가",
    description: "실용적이고 현실적이며, 즉흥적이고 모험을 즐기는 성격입니다. 문제 해결 능력이 뛰어나고 유연하게 상황에 적응합니다."
  },
  "ESFP": {
    title: "자유로운 영혼",
    description: "사교적이고 낙관적이며, 다른 사람들과 함께하는 것을 좋아합니다. 실용적이고 현실적이며, 즐거움과 재미를 추구합니다."
  },
  "ENFP": {
    title: "열정적인 창조자",
    description: "창의적이고 열정적이며, 새로운 가능성을 발견하는 능력이 뛰어납니다. 공감능력이 강하고 다른 사람들을 영감받게 합니다."
  },
  "ENTP": {
    title: "대담한 사상가",
    description: "창의적이고 독창적이며, 지적 도전을 추구합니다. 혁신적이고 전략적 사고를 가지고 있으며, 새로운 아이디어를 탐구하는 것을 좋아합니다."
  },
  "ESTJ": {
    title: "엄격한 관리자",
    description: "체계적이고 실용적이며, 효율적인 조직과 관리 능력이 뛰어납니다. 책임감이 강하고 규칙을 중시하며, 확실한 결과를 추구합니다."
  },
  "ESFJ": {
    title: "사교적인 외교관",
    description: "따뜻하고 사교적이며, 다른 사람들을 돕는 것을 좋아합니다. 협력적이고 충성스럽지만, 인정받고 싶어하는 욕구가 강합니다."
  },
  "ENFJ": {
    title: "카리스마 있는 지도자",
    description: "영감을 주는 리더십을 가지고 있으며, 다른 사람들의 성장을 돕는 것을 좋아합니다. 공감능력이 강하고 협력적이며, 이상적입니다."
  },
  "ENTJ": {
    title: "대담한 사령관",
    description: "강력한 리더십과 전략적 사고를 가지고 있으며, 효율적이고 체계적인 조직을 만드는 능력이 뛰어납니다. 독립적이고 결단력이 강합니다."
  }
};

const SimteTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [personalityType, setPersonalityType] = useState(null);

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    Object.keys(answers).forEach(questionId => {
      const question = questions.find(q => q.id === parseInt(questionId));
      const selectedOption = question.options[answers[questionId]];
      
      Object.keys(selectedOption.score).forEach(key => {
        scores[key] += selectedOption.score[key];
      });
    });

    const type = [
      scores.E > scores.I ? 'E' : 'I',
      scores.S > scores.N ? 'S' : 'N',
      scores.T > scores.F ? 'T' : 'F',
      scores.J > scores.P ? 'J' : 'P'
    ].join('');

    setPersonalityType(type);
    setShowResult(true);
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setPersonalityType(null);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResult && personalityType) {
    return (
      <TestContainer>
        <Header>
          <Title>심리테스트 결과</Title>
          <Subtitle>당신의 성격 유형을 확인해보세요</Subtitle>
        </Header>
        
        <ResultContainer>
          <ResultTitle>{personalityTypes[personalityType]?.title || '분석 중...'}</ResultTitle>
          <ResultDescription>
            {personalityTypes[personalityType]?.description || '결과를 분석하고 있습니다...'}
          </ResultDescription>
          <RestartButton onClick={restartTest}>
            테스트 다시하기
          </RestartButton>
        </ResultContainer>
      </TestContainer>
    );
  }

  const currentQ = questions[currentQuestion];
  const selectedAnswer = answers[currentQ.id];

  return (
    <TestContainer>
      <Header>
        <Title>성격 유형 테스트</Title>
        <Subtitle>당신의 성격 유형을 알아보세요</Subtitle>
      </Header>

      <ProgressBar>
        <ProgressFill progress={progress} />
      </ProgressBar>

      <QuestionContainer>
        <QuestionText>
          {currentQ.text}
        </QuestionText>
        
        <OptionsContainer>
          {currentQ.options.map((option, index) => (
            <OptionButton
              key={index}
              selected={selectedAnswer === index}
              onClick={() => handleAnswer(currentQ.id, index)}
            >
              {option.text}
            </OptionButton>
          ))}
        </OptionsContainer>
      </QuestionContainer>

      {selectedAnswer !== undefined && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <OptionButton
            onClick={nextQuestion}
            style={{ 
              background: '#4CAF50', 
              color: 'white', 
              border: 'none',
              textAlign: 'center',
              width: '200px'
            }}
          >
            {currentQuestion === questions.length - 1 ? '결과 보기' : '다음 질문'}
          </OptionButton>
        </div>
      )}
    </TestContainer>
  );
};

export default SimteTest; 