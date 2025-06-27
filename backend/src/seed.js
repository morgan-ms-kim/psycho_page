import sequelize, { Test, Comment, Like, Visitor } from './models/index.js';

const seedData = async () => {
  try {
    // 기존 데이터 삭제
    await Test.destroy({ where: {} });
    await Comment.destroy({ where: {} });
    await Like.destroy({ where: {} });
    await Visitor.destroy({ where: {} });

    // 테스트 데이터 생성
    const tests = await Test.bulkCreate([
      {
        id: 1,
        title: "당신의 숨겨진 성격은?",
        description: "의식하지 못했던 당신만의 특별한 성격을 발견해보세요.",
        category: "성격",
        thumbnail: "/tests/test1/thumb.png",
        banner: "/tests/test1/banner.png",
        questions: [
          {
            question: "새로운 환경에 갔을 때 당신은?",
            answers: [
              "적극적으로 사람들과 어울린다",
              "조용히 주변을 관찰한다"
            ]
          },
          {
            question: "문제가 생겼을 때 당신은?",
            answers: [
              "즉시 해결책을 찾아본다",
              "차분히 생각해보고 결정한다"
            ]
          },
          {
            question: "주말에 무엇을 하시나요?",
            answers: [
              "친구들과 만나서 놀거나 활동적인 일을 한다",
              "집에서 혼자 시간을 보내거나 조용한 취미를 즐긴다"
            ]
          },
          {
            question: "일할 때 당신은?",
            answers: [
              "즉흥적으로 상황에 맞춰 처리한다",
              "계획을 세우고 체계적으로 진행한다"
            ]
          },
          {
            question: "스트레스 해소 방법은?",
            answers: [
              "운동이나 활동적인 것을 한다",
              "독서나 음악 감상 등 조용한 것을 한다"
            ]
          }
        ],
        results: [
          {
            title: "열정적인 리더",
            description: "적극적이고 도전적인 성격의 소유자입니다. 새로운 일에 대한 열정이 넘치며, 사람들을 이끄는 리더십을 가지고 있습니다.",
            image: "/tests/test1/result1.png"
          },
          {
            title: "신중한 분석가",
            description: "차분하고 논리적인 성격의 소유자입니다. 문제를 깊이 있게 분석하고 신중하게 결정을 내리는 능력이 뛰어납니다.",
            image: "/tests/test1/result2.png"
          },
          {
            title: "창의적인 예술가",
            description: "감성적이고 창의적인 성격의 소유자입니다. 독특한 아이디어를 가지고 있으며, 예술적 감각이 뛰어납니다.",
            image: "/tests/test1/result3.png"
          },
          {
            title: "실용적인 현실주의자",
            description: "현실적이고 실용적인 성격의 소유자입니다. 구체적인 목표를 설정하고 체계적으로 달성하는 능력이 있습니다.",
            image: "/tests/test1/result4.png"
          }
        ],
        views: 1250,
        likes: 89,
        createdAt: new Date('2024-01-10')
      },
      {
        id: 2,
        title: "당신의 스트레스 해소법은?",
        description: "스트레스 상황에서 당신이 선택하는 해소 방법을 알아보세요.",
        category: "라이프스타일",
        thumbnail: "/tests/test2/thumb.png",
        banner: "/tests/test2/banner.png",
        questions: [
          {
            question: "스트레스를 받았을 때 가장 먼저 하고 싶은 것은?",
            answers: [
              "친구나 가족과 이야기한다",
              "혼자만의 시간을 가진다"
            ]
          },
          {
            question: "스트레스 해소를 위해 선택하는 활동은?",
            answers: [
              "운동이나 산책 등 활동적인 것",
              "독서나 음악 감상 등 조용한 것"
            ]
          },
          {
            question: "스트레스 상황에서 당신의 반응은?",
            answers: [
              "즉시 해결책을 찾아본다",
              "시간을 두고 차분히 생각해본다"
            ]
          },
          {
            question: "스트레스 해소 후 기분은?",
            answers: [
              "에너지가 넘치고 활기찬 상태",
              "평온하고 차분한 상태"
            ]
          },
          {
            question: "스트레스 해소를 위해 선호하는 장소는?",
            answers: [
              "야외나 공공장소",
              "집이나 조용한 공간"
            ]
          }
        ],
        results: [
          {
            title: "활동적 해소형",
            description: "움직이면서 스트레스를 해소하는 타입입니다. 운동, 산책, 춤 등 활동적인 방법으로 에너지를 발산하고 기분을 전환합니다.",
            image: "/tests/test2/result1.png"
          },
          {
            title: "조용한 회복형",
            description: "조용한 시간을 통해 스트레스를 해소하는 타입입니다. 독서, 음악 감상, 명상 등으로 마음을 진정시키고 에너지를 회복합니다.",
            image: "/tests/test2/result2.png"
          },
          {
            title: "소통 해소형",
            description: "다른 사람과의 대화를 통해 스트레스를 해소하는 타입입니다. 친구나 가족과의 대화로 감정을 나누고 위로를 받습니다.",
            image: "/tests/test2/result3.png"
          },
          {
            title: "문제 해결형",
            description: "스트레스의 원인을 직접 해결함으로써 해소하는 타입입니다. 문제를 분석하고 구체적인 해결책을 찾아 실행합니다.",
            image: "/tests/test2/result4.png"
          }
        ],
        views: 980,
        likes: 67,
        createdAt: new Date('2024-01-12')
      },
      {
        id: 3,
        title: "당신의 성격 유형은?",
        description: "MBTI 기반 성격 유형을 알아보는 심리테스트입니다.",
        category: "성격",
        thumbnail: "/tests/test3/thumb.png",
        banner: "/tests/test3/banner.png",
        questions: [
          {
            question: "새로운 사람들과 만날 때 당신은?",
            answers: [
              "적극적으로 대화를 시작한다",
              "상대방이 먼저 말을 걸어주기를 기다린다"
            ]
          },
          {
            question: "주말에 무엇을 하시나요?",
            answers: [
              "친구들과 만나서 놀거나 활동적인 일을 한다",
              "집에서 혼자 시간을 보내거나 조용한 취미를 즐긴다"
            ]
          },
          {
            question: "문제가 생겼을 때 당신은?",
            answers: [
              "직감적으로 빠르게 결정한다",
              "충분히 생각하고 분석한 후 결정한다"
            ]
          },
          {
            question: "일할 때 당신은?",
            answers: [
              "마감일을 지키기 위해 계획을 세운다",
              "즉흥적으로 상황에 맞춰 처리한다"
            ]
          },
          {
            question: "스트레스 해소 방법은?",
            answers: [
              "운동이나 활동적인 것을 한다",
              "독서나 음악 감상 등 조용한 것을 한다"
            ]
          }
        ],
        results: [
          {
            title: "ENFP - 열정적인 영감가",
            description: "창의적이고 열정적인 당신은 새로운 가능성을 발견하는 것을 좋아합니다. 사람들과의 교류를 통해 에너지를 얻으며, 항상 새로운 아이디어를 추구합니다.",
            image: "/tests/test3/result1.png"
          },
          {
            title: "INTJ - 전략적 사상가",
            description: "논리적이고 분석적인 당신은 복잡한 문제를 해결하는 것을 즐깁니다. 독립적이고 효율적인 방법을 선호하며, 장기적인 계획을 세우는 데 능합니다.",
            image: "/tests/test3/result2.png"
          },
          {
            title: "ESFJ - 사교적인 돌봄꾼",
            description: "따뜻하고 책임감 있는 당신은 다른 사람들을 돕는 것을 좋아합니다. 조직적이고 협력적인 환경에서 가장 잘 발휘되며, 조화를 추구합니다.",
            image: "/tests/test3/result3.png"
          },
          {
            title: "ISTP - 만능 재주꾼",
            description: "실용적이고 유연한 당신은 문제를 해결하는 데 뛰어납니다. 독립적이면서도 필요할 때는 팀워크를 발휘하며, 즉흥적인 상황 대처에 능합니다.",
            image: "/tests/test3/result4.png"
          }
        ],
        views: 2100,
        likes: 156,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 4,
        title: "당신의 연애 스타일은?",
        description: "연애에서 보이는 당신만의 특별한 스타일을 알아보는 심리테스트입니다.",
        category: "연애",
        thumbnail: "/tests/test4/thumb.png",
        banner: "/tests/test4/banner.png",
        questions: [
          {
            question: "좋아하는 사람이 생겼을 때 당신은?",
            answers: [
              "적극적으로 접근해서 대화를 시도한다",
              "조용히 관찰하면서 기회를 기다린다"
            ]
          },
          {
            question: "데이트 계획을 세울 때 당신은?",
            answers: [
              "미리 세밀하게 계획을 세운다",
              "즉흥적으로 상황에 맞춰 진행한다"
            ]
          },
          {
            question: "연인과 다퉜을 때 당신은?",
            answers: [
              "바로 대화해서 문제를 해결하려 한다",
              "시간을 두고 차분히 생각해본다"
            ]
          },
          {
            question: "연인에게 선물을 줄 때 당신은?",
            answers: [
              "실용적이고 필요한 것을 선호한다",
              "의미 있고 특별한 것을 선호한다"
            ]
          },
          {
            question: "연인과의 관계에서 가장 중요한 것은?",
            answers: [
              "서로의 개인 시간과 공간을 존중하는 것",
              "항상 함께 있고 소통하는 것"
            ]
          }
        ],
        results: [
          {
            title: "열정적인 로맨티스트",
            description: "사랑에 있어서 적극적이고 열정적인 당신은 연인에게 깊은 애정을 표현합니다. 감정 표현이 풍부하고 로맨틱한 데이트를 즐기며, 연인과의 소통을 중요시합니다.",
            image: "/tests/test4/result1.png"
          },
          {
            title: "신중한 현실주의자",
            description: "연애에서도 신중하고 현실적인 당신은 안정적인 관계를 추구합니다. 감정보다는 이성적으로 판단하며, 연인과의 미래를 구체적으로 계획하는 것을 좋아합니다.",
            image: "/tests/test4/result2.png"
          },
          {
            title: "자유로운 영혼",
            description: "자유롭고 독립적인 당신은 연인과의 관계에서도 개인적인 공간을 중요시합니다. 구속받는 것을 싫어하며, 서로를 존중하는 건강한 관계를 추구합니다.",
            image: "/tests/test4/result3.png"
          },
          {
            title: "따뜻한 보호자",
            description: "연인을 보호하고 돌보는 것을 좋아하는 당신은 헌신적이고 책임감 있는 파트너입니다. 연인의 행복을 위해 노력하며, 안정적이고 신뢰할 수 있는 관계를 만듭니다.",
            image: "/tests/test4/result4.png"
          }
        ],
        views: 1750,
        likes: 134,
        createdAt: new Date('2024-01-16')
      },
      {
        id: 5,
        title: "당신에게 맞는 직업은?",
        description: "당신의 성향과 능력을 바탕으로 가장 적합한 직업을 찾아보는 심리테스트입니다.",
        category: "직업",
        thumbnail: "/tests/test5/thumb.png",
        banner: "/tests/test5/banner.png",
        questions: [
          {
            question: "새로운 프로젝트를 시작할 때 당신은?",
            answers: [
              "팀원들과 함께 브레인스토밍을 한다",
              "혼자서 차분히 계획을 세운다"
            ]
          },
          {
            question: "문제가 생겼을 때 당신은?",
            answers: [
              "창의적인 해결책을 찾아본다",
              "기존의 검증된 방법을 사용한다"
            ]
          },
          {
            question: "일할 때 당신이 선호하는 환경은?",
            answers: [
              "자유롭고 유연한 분위기",
              "체계적이고 규칙적인 분위기"
            ]
          },
          {
            question: "성과를 측정할 때 당신은?",
            answers: [
              "구체적인 수치와 결과를 중요시한다",
              "과정과 노력을 중요시한다"
            ]
          },
          {
            question: "새로운 기술을 배울 때 당신은?",
            answers: [
              "실습을 통해 직접 경험한다",
              "이론을 먼저 공부한다"
            ]
          }
        ],
        results: [
          {
            title: "창의적 전문가",
            description: "창의력과 혁신적인 사고를 가진 당신은 디자이너, 마케터, 콘텐츠 크리에이터 같은 직업에 적합합니다. 새로운 아이디어를 발굴하고 독창적인 솔루션을 제공하는 능력이 뛰어납니다.",
            image: "/tests/test5/result1.png"
          },
          {
            title: "분석적 전문가",
            description: "논리적 사고와 분석 능력이 뛰어난 당신은 데이터 분석가, 연구원, 엔지니어 같은 직업에 적합합니다. 복잡한 문제를 체계적으로 분석하고 해결하는 능력이 있습니다.",
            image: "/tests/test5/result2.png"
          },
          {
            title: "리더십 전문가",
            description: "사람들을 이끌고 조직을 관리하는 능력이 뛰어난 당신은 매니저, 컨설턴트, 교육자 같은 직업에 적합합니다. 팀워크를 중시하고 목표 달성을 위해 노력합니다.",
            image: "/tests/test5/result3.png"
          },
          {
            title: "실용적 전문가",
            description: "실무 능력과 문제 해결 능력이 뛰어난 당신은 기술자, 의료진, 법무사 같은 직업에 적합합니다. 구체적인 결과를 만들어내고 실용적인 솔루션을 제공합니다.",
            image: "/tests/test5/result4.png"
          }
        ],
        views: 890,
        likes: 78,
        createdAt: new Date('2024-01-17')
      }
    ]);

    // 샘플 댓글 생성
    await Comment.bulkCreate([
      {
        testId: 1,
        nickname: "테스터1",
        content: "정말 정확한 결과가 나왔어요! 재미있었습니다.",
        ip: "192.168.1.1"
      },
      {
        testId: 1,
        nickname: "심리학자",
        content: "성격 분석이 꽤 정교하게 되어 있네요. 좋은 테스트입니다.",
        ip: "192.168.1.2"
      },
      {
        testId: 2,
        nickname: "스트레스맨",
        content: "스트레스 해소법이 정말 도움이 되었어요!",
        ip: "192.168.1.3"
      },
      {
        testId: 3,
        nickname: "MBTI러버",
        content: "MBTI 기반이라 더욱 신뢰할 수 있는 결과였습니다.",
        ip: "192.168.1.4"
      },
      {
        testId: 4,
        nickname: "연애고수",
        content: "연애 스타일이 정말 정확하게 나왔어요!",
        ip: "192.168.1.5"
      },
      {
        testId: 5,
        nickname: "직업탐색가",
        content: "직업 적성 테스트가 진로 결정에 도움이 되었습니다.",
        ip: "192.168.1.6"
      }
    ]);

    // 샘플 좋아요 생성
    await Like.bulkCreate([
      { testId: 1, ip: "192.168.1.1" },
      { testId: 1, ip: "192.168.1.2" },
      { testId: 1, ip: "192.168.1.3" },
      { testId: 2, ip: "192.168.1.1" },
      { testId: 2, ip: "192.168.1.4" },
      { testId: 3, ip: "192.168.1.1" },
      { testId: 3, ip: "192.168.1.5" },
      { testId: 4, ip: "192.168.1.2" },
      { testId: 5, ip: "192.168.1.3" }
    ]);

    // 샘플 방문자 기록
    await Visitor.bulkCreate([
      { ip: "192.168.1.1", testId: 1, userAgent: "Mozilla/5.0..." },
      { ip: "192.168.1.2", testId: 1, userAgent: "Mozilla/5.0..." },
      { ip: "192.168.1.3", testId: 2, userAgent: "Mozilla/5.0..." },
      { ip: "192.168.1.4", testId: 3, userAgent: "Mozilla/5.0..." },
      { ip: "192.168.1.5", testId: 4, userAgent: "Mozilla/5.0..." }
    ]);

    console.log('시드 데이터가 성공적으로 생성되었습니다!');
    console.log(`- 테스트: ${tests.length}개`);
    console.log('- 댓글: 6개');
    console.log('- 좋아요: 9개');
    console.log('- 방문자: 5명');

  } catch (error) {
    console.error('시드 데이터 생성 실패:', error);
  } finally {
    await sequelize.close();
  }
};

seedData(); 