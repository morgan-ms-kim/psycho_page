import sequelize, { Test, Comment, Like, Visitor } from './models/index.js';

const testData = [
  {
    title: '오락실 캐릭터 유형 테스트',
    description: '레트로 오락실 감성의 캐릭터 유형 심리테스트',
    thumbnail: '/tests/test1/thumb.png',
    banner: '/tests/test1/banner.png',
    views: 1247,
    likes: 89,
    questions: [
      {
        question: '오락실에서 가장 먼저 하고 싶은 게임은?',
        answers: ['철권', '테트리스', '팩맨', '스네이크']
      },
      {
        question: '게임하다가 실수했을 때 당신의 반응은?',
        answers: ['화를 낸다', '웃어넘긴다', '다시 도전한다', '다른 게임을 한다']
      },
      {
        question: '오락실에서 친구와 함께라면?',
        answers: ['대전 게임을 한다', '협력 게임을 한다', '각자 다른 게임을 한다', '점수 경쟁을 한다']
      },
      {
        question: '게임에서 이길 때의 기분은?',
        answers: ['자신감이 생긴다', '다음에도 이기고 싶다', '친구들에게 자랑한다', '평범하다']
      }
    ],
    results: [
      {
        title: '전사형 캐릭터',
        description: '당신은 강한 의지와 도전정신을 가진 전사형입니다. 어려운 상황에서도 포기하지 않고 끝까지 싸우는 성격이에요.',
        image: '/tests/test1/result1.png'
      },
      {
        title: '마법사형 캐릭터',
        description: '당신은 창의적이고 독창적인 마법사형입니다. 새로운 아이디어를 잘 떠올리고 문제를 창의적으로 해결하는 능력이 뛰어나요.',
        image: '/tests/test1/result2.png'
      },
      {
        title: '궁수형 캐릭터',
        description: '당신은 정확하고 신중한 궁수형입니다. 상황을 잘 파악하고 정확한 판단을 내리는 능력이 뛰어나요.',
        image: '/tests/test1/result3.png'
      },
      {
        title: '힐러형 캐릭터',
        description: '당신은 따뜻하고 배려심 깊은 힐러형입니다. 다른 사람을 돕고 위로하는 것을 좋아하는 성격이에요.',
        image: '/tests/test1/result4.png'
      }
    ]
  },
  {
    title: '나의 하루 루틴 테스트',
    description: '나의 하루 습관과 루틴을 알아보는 심리테스트',
    thumbnail: '/tests/test2/thumb.png',
    banner: '/tests/test2/banner.png',
    views: 892,
    likes: 156,
    questions: [
      {
        question: '아침에 일어나면 가장 먼저 하는 일은?',
        answers: ['물 마시기', '핸드폰 확인', '세수하기', '운동하기']
      },
      {
        question: '아침 식사는 주로?',
        answers: ['집에서 요리', '외식', '간단한 음식', '거르기']
      },
      {
        question: '하루 중 가장 활력이 넘치는 시간은?',
        answers: ['아침', '점심', '오후', '저녁']
      },
      {
        question: '잠들기 전에 주로 하는 일은?',
        answers: ['책 읽기', 'TV 보기', 'SNS 확인', '명상']
      }
    ],
    results: [
      {
        title: '계획형 루틴러',
        description: '당신은 체계적이고 계획적인 루틴러입니다. 매일 일정한 패턴을 유지하며 효율적으로 하루를 보내는 타입이에요.',
        image: '/tests/test2/result1.png'
      },
      {
        title: '자유형 루틴러',
        description: '당신은 자유롭고 유연한 루틴러입니다. 상황에 따라 유연하게 대처하며 스트레스 없이 하루를 보내는 타입이에요.',
        image: '/tests/test2/result2.png'
      },
      {
        title: '에너지형 루틴러',
        description: '당신은 활력이 넘치는 에너지형 루틴러입니다. 항상 긍정적이고 새로운 것에 도전하는 것을 좋아하는 타입이에요.',
        image: '/tests/test2/result3.png'
      },
      {
        title: '휴식형 루틴러',
        description: '당신은 여유롭고 평화로운 휴식형 루틴러입니다. 천천히 여유를 가지고 하루를 보내는 것을 선호하는 타입이에요.',
        image: '/tests/test2/result4.png'
      }
    ]
  },
  {
    title: 'MBTI 성격 유형 테스트',
    description: '나의 MBTI 성격 유형을 알아보는 심리테스트',
    thumbnail: '/tests/test3/thumb.png',
    banner: '/tests/test3/banner.png',
    views: 2156,
    likes: 234,
    questions: [
      {
        question: '새로운 사람들과 만날 때 당신은?',
        answers: ['적극적으로 대화를 시작한다', '상대방이 먼저 말을 걸어주길 기다린다', '관찰하면서 천천히 친해진다', '불편해한다']
      },
      {
        question: '문제가 생겼을 때 당신의 해결 방법은?',
        answers: ['논리적으로 분석한다', '직감적으로 판단한다', '다른 사람의 의견을 듣는다', '시간을 두고 생각한다']
      },
      {
        question: '주말에 가장 하고 싶은 일은?',
        answers: ['친구들과 만나기', '혼자만의 시간 보내기', '새로운 장소 탐방', '집에서 휴식']
      },
      {
        question: '일할 때 당신의 스타일은?',
        answers: ['계획을 세우고 체계적으로', '즉흥적이고 창의적으로', '팀워크를 중시하여', '완벽하게 마무리하는']
      }
    ],
    results: [
      {
        title: 'ENTJ - 지도자형',
        description: '당신은 리더십이 뛰어나고 목표 지향적인 ENTJ입니다. 효율적이고 논리적인 사고를 가지고 있어요.',
        image: '/tests/test3/result1.png'
      },
      {
        title: 'INFP - 이상주의자형',
        description: '당신은 창의적이고 이상적인 INFP입니다. 깊은 감성과 공감 능력을 가지고 있어요.',
        image: '/tests/test3/result2.png'
      },
      {
        title: 'ESTP - 모험가형',
        description: '당신은 적응력이 뛰어나고 실용적인 ESTP입니다. 현재를 즐기며 새로운 경험을 추구해요.',
        image: '/tests/test3/result3.png'
      },
      {
        title: 'ISFJ - 수호자형',
        description: '당신은 책임감이 강하고 배려심 깊은 ISFJ입니다. 안정적이고 신뢰할 수 있는 성격이에요.',
        image: '/tests/test3/result4.png'
      }
    ]
  },
  {
    title: '연애 스타일 테스트',
    description: '나의 연애 스타일과 성향을 알아보는 심리테스트',
    thumbnail: '/tests/test4/thumb.png',
    banner: '/tests/test4/banner.png',
    views: 1893,
    likes: 167,
    questions: [
      {
        question: '이상적인 데이트는?',
        answers: ['로맨틱한 저녁 식사', '즐거운 놀이공원', '조용한 카페에서 대화', '새로운 장소 탐방']
      },
      {
        question: '연인과 다퉜을 때 당신은?',
        answers: ['바로 화해하려고 한다', '시간을 두고 생각한다', '상대방이 먼저 사과하기를 기다린다', '문제를 분석한다']
      },
      {
        question: '연인에게 가장 중요한 것은?',
        answers: ['사랑과 애정', '신뢰와 이해', '재미와 즐거움', '성장과 발전']
      },
      {
        question: '연인과의 관계에서 당신의 역할은?',
        answers: ['보호하고 돌보는 역할', '함께 성장하는 파트너', '즐거움을 주는 역할', '조용히 지지하는 역할']
      }
    ],
    results: [
      {
        title: '로맨틱형 연인',
        description: '당신은 로맨틱하고 감성적인 연인입니다. 깊은 사랑과 애정을 중요시하며, 연인을 위해 특별한 순간을 만들어주는 것을 좋아해요.',
        image: '/tests/test4/result1.png'
      },
      {
        title: '친구형 연인',
        description: '당신은 편안하고 자연스러운 친구형 연인입니다. 연인과의 관계에서도 편안함과 이해를 가장 중요하게 생각해요.',
        image: '/tests/test4/result2.png'
      },
      {
        title: '즐거운형 연인',
        description: '당신은 재미있고 활기찬 즐거운형 연인입니다. 연인과 함께 새로운 경험을 하고 즐거운 시간을 보내는 것을 선호해요.',
        image: '/tests/test4/result3.png'
      },
      {
        title: '성장형 연인',
        description: '당신은 함께 성장하는 성장형 연인입니다. 연인과의 관계에서 서로를 발전시키고 더 나은 사람이 되는 것을 중요하게 생각해요.',
        image: '/tests/test4/result4.png'
      }
    ]
  },
  {
    title: '직업 적성 테스트',
    description: '나에게 맞는 직업과 적성을 알아보는 심리테스트',
    thumbnail: '/tests/test5/thumb.png',
    banner: '/tests/test5/banner.png',
    views: 1456,
    likes: 98,
    questions: [
      {
        question: '일할 때 가장 중요하게 생각하는 것은?',
        answers: ['창의성과 자유', '안정성과 보수', '성장과 발전', '사람들과의 관계']
      },
      {
        question: '문제를 해결할 때 당신의 방식은?',
        answers: ['혼자서 깊이 생각한다', '다른 사람과 상의한다', '즉흥적으로 해결한다', '체계적으로 분석한다']
      },
      {
        question: '스트레스를 받을 때 당신은?',
        answers: ['혼자만의 시간을 가진다', '친구들과 만난다', '운동을 한다', '음악을 듣는다']
      },
      {
        question: '성공에 대한 당신의 정의는?',
        answers: ['자신만의 목표 달성', '사회적 인정', '재정적 안정', '행복한 삶']
      }
    ],
    results: [
      {
        title: '창의적 전문가',
        description: '당신은 창의성과 전문성을 살릴 수 있는 직업이 적합합니다. 예술가, 디자이너, 작가, 연구원 등이 좋은 선택이에요.',
        image: '/tests/test5/result1.png'
      },
      {
        title: '안정적 전문직',
        description: '당신은 안정적이고 전문적인 직업이 적합합니다. 의사, 변호사, 회계사, 공무원 등이 좋은 선택이에요.',
        image: '/tests/test5/result2.png'
      },
      {
        title: '리더형 경영자',
        description: '당신은 리더십을 발휘할 수 있는 경영직이 적합합니다. CEO, 매니저, 프로젝트 리더 등이 좋은 선택이에요.',
        image: '/tests/test5/result3.png'
      },
      {
        title: '서비스형 전문가',
        description: '당신은 사람들을 돕는 서비스직이 적합합니다. 상담사, 교사, 간호사, 사회복지사 등이 좋은 선택이에요.',
        image: '/tests/test5/result4.png'
      }
    ]
  }
];

// 시드 데이터 실행
const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // 기존 데이터 삭제 후 재생성
    
    console.log('데이터베이스 동기화 완료');
    
    // 테스트 데이터 추가
    for (const testDataItem of testData) {
      const test = await Test.create({
        title: testDataItem.title,
        description: testDataItem.description,
        thumbnail: testDataItem.thumbnail,
        banner: testDataItem.banner,
        views: testDataItem.views,
        likes: testDataItem.likes,
        questions: testDataItem.questions,
        results: testDataItem.results
      });
      
      console.log(`테스트 생성 완료: ${test.title}`);
    }
    
    // 샘플 댓글 추가
    const sampleComments = [
      { nickname: '테스터1', content: '정말 재미있는 테스트였어요!' },
      { nickname: '심리학자', content: '결과가 정확하게 나왔네요.' },
      { nickname: '게임러버', content: '오락실 테스트 너무 재밌어요!' },
      { nickname: 'MBTI팬', content: '성격 테스트 결과가 신기해요.' },
      { nickname: '연애고수', content: '연애 스타일 테스트 완전 공감해요!' }
    ];
    
    for (let i = 0; i < testData.length; i++) {
      const comment = sampleComments[i % sampleComments.length];
      await Comment.create({
        testId: i + 1,
        nickname: comment.nickname,
        content: comment.content
      });
    }
    
    // 샘플 방문자 데이터 추가
    for (let i = 0; i < 100; i++) {
      await Visitor.create({
        ip: `192.168.1.${i % 255}`,
        country: 'Korea',
        region: 'Seoul',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        testId: Math.floor(Math.random() * testData.length) + 1
      });
    }
    
    console.log('시드 데이터 생성 완료!');
    process.exit(0);
  } catch (error) {
    console.error('시드 데이터 생성 실패:', error);
    process.exit(1);
  }
};

seedDatabase(); 