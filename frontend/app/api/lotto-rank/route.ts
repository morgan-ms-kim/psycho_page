import { NextRequest } from 'next/server';

// 최신 회차를 1178부터 올려가며 찾는 함수
async function getLatestDrawNo(start = 1178) {
  let n = start;
  while (true) {
    const res = await fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${n}`);
    const data = await res.json();
    if (data.returnValue !== 'success') {
      return n - 1;
    }
    n++;
    if (n > start + 100) break; // 안전장치
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const count = Number(searchParams.get('count') || 100);

  try {
    // 최신 회차 번호 찾기
    const latestNo = await getLatestDrawNo(1178);
    if (!latestNo) return Response.json({ error: '최신 회차 찾기 실패' }, { status: 500 });
    const stats: { [num: number]: number } = {};
    for (let i = 1; i <= 45; i++) stats[i] = 0;
    for (let n = latestNo; n > latestNo - count && n > 0; n--) {
      const res = await fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${n}`);
      const data = await res.json();
      if (data.returnValue === 'success') {
        [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6, data.bnusNo].forEach(num => {
          if (num >= 1 && num <= 45) stats[num] += 1;
        });
      }
    }
    const statsArr = Object.entries(stats).map(([num, cnt]) => ({ num: Number(num), cnt }));
    const top30 = statsArr.sort((a, b) => b.cnt - a.cnt || a.num - b.num).slice(0, 30);
    return Response.json({ top30 });
  } catch (e) {
    return Response.json({ error: '로또 데이터 조회 실패' }, { status: 500 });
  }
} 