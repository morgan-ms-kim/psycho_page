import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 32px auto;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 32px 24px;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
`;

const ProfileBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 16px 0 8px 0;
`;

const SubTitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 16px;
`;

const StatBar = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
`;

const Stat = styled.div`
  font-size: 1rem;
  color: #888;
`;

const Author = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const CommentBox = styled.div`
  background: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const RelatedTests = styled.div`
  margin-top: 32px;
`;

const RelatedTestItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

export default function FoxPowerTest() {
  return (
    <Container>
      <ProfileBar>
        <div>내 프로필/계정 불러오기</div>
        <button>시작하기</button>
      </ProfileBar>
      <StatBar>
        <Stat>참여자수: 278,730명</Stat>
        <Stat>조회수: 360,232</Stat>
        <Stat>댓글: 1</Stat>
      </StatBar>
      <Title>폭스력 테스트</Title>
      <SubTitle>나만의 연애 스킬! 내 폭스력 Level은?</SubTitle>
      <Author>
        <img src="https://cdn.metavv.com/prod/uploads/profile/images/10035224/171384015856825_sm.png" alt="author" width={32} height={32} style={{borderRadius: '50%'}} />
        <span>방구석연구소-심테LAB</span>
        <span style={{color:'#aaa'}}>· 팔로워 2908 · 콘텐츠 187</span>
      </Author>
      <CommentBox>
        <b>hyeon4246</b> <br />
        재밌어요!
      </CommentBox>
      <RelatedTests>
        <h3>관련 테스트</h3>
        <RelatedTestItem>
          <img src="https://cdn.metavv.com/prod/uploads/profile/images/10980330/174306084619466_sm.jpeg" alt="user" width={32} height={32} style={{borderRadius: '50%'}} />
          <span>연애 온도 테스트</span>
        </RelatedTestItem>
        {/* ...다른 추천 테스트 추가 */}
      </RelatedTests>
      <div style={{marginTop:32, textAlign:'center'}}>
        <img src="https://www.metavv.com/_next/image?url=https%3A%2F%2Fcdn.metavv.com%2Fprod%2Ftemp%2Fheader-logo%2Fimages%2F174107953240817.png&w=256&q=75" alt="메타브" width={120} />
        <div>앱으로 보기</div>
      </div>
    </Container>
  );
}