'use client';
import React, { useState, useEffect } from 'react';
import styles from './lotto.module.css';

const digitOptions = [
  { label: '1의 자리', min: 0, max: 9, countMax: 10 },
  { label: '10의 자리', min: 10, max: 19, countMax: 10 },
  { label: '20의 자리', min: 20, max: 29, countMax: 10 },
  { label: '30의 자리', min: 30, max: 39, countMax: 10 },
  { label: '40의 자리', min: 40, max: 45, countMax: 6 },
];

export default function LottoPage() {
  const [counts, setCounts] = useState(Array(digitOptions.length).fill(0));
  const [results, setResults] = useState<number[][]>([]);
  const [combined, setCombined] = useState<number[]>([]);
  const [copyMsg, setCopyMsg] = useState('');
  const [randomLotto, setRandomLotto] = useState<number[]>([]);
  const [numberStats, setNumberStats] = useState<{[num: number]: number}>(() => {
    const stats: {[num: number]: number} = {};
    for (let i = 1; i <= 45; i++) stats[i] = 0;
    return stats;
  });

  // 실제 로또 랭킹 관련 상태
  const [drawCount, setDrawCount] = useState(10); // 기본 최근 10회
  const [realRank, setRealRank] = useState<{num: number, cnt: number}[]>([]);
  const [realLoading, setRealLoading] = useState(false);
  const [realError, setRealError] = useState('');

  const handleCountChange = (idx: number, val: number) => {
    let next = [...counts];
    val = Math.max(0, Math.min(val, digitOptions[idx].countMax));
    next[idx] = val;
    const total = next.reduce((a, b) => a + b, 0);
    if (total > 6) {
      next[idx] = Math.max(0, val - (total - 6));
    }
    if (next[idx] === 6) {
      next = next.map((v, i) => (i === idx ? 6 : 0));
    }
    setCounts(next);
  };

  const handleGenerate = () => {
    let total = counts.reduce((a, b) => a + b, 0);
    let autoCounts = [...counts];
    if (total === 0) {
      const arr: number[] = [];
      while (arr.length < 6) {
        const n = Math.floor(Math.random() * 45) + 1;
        if (!arr.includes(n)) arr.push(n);
      }
      arr.sort((a, b) => a - b);
      setResults([]);
      setCombined(arr);
      setCopyMsg('');
      // 출현 횟수 누적
      const newStats = { ...numberStats };
      arr.forEach(n => { if (n >= 1 && n <= 45) newStats[n] += 1; });
      setNumberStats(newStats);
      return;
    }
    let picked: number[] = [];
    const generated: number[][] = digitOptions.map((opt, idx) => {
      const arr: number[] = [];
      const count = autoCounts[idx];
      for (let i = 0; i < count; i++) {
        let n;
        do {
          n = Math.floor(Math.random() * (opt.max - opt.min + 1)) + opt.min;
        } while (n === 0 || arr.includes(n) || picked.includes(n));
        arr.push(n);
        picked.push(n);
      }
      if (opt.label === '40의 자리') arr.sort((a, b) => a - b);
      return arr;
    });
    let remain = 6 - picked.length;
    let pool = Array.from({length: 45}, (_, i) => i + 1).filter(n => !picked.includes(n));
    for (let i = 0; i < remain; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool[idx]);
      pool.splice(idx, 1);
    }
    picked.sort((a, b) => a - b);
    setResults(generated);
    setCombined(picked);
    setCopyMsg('');
    // 출현 횟수 누적
    const newStats = { ...numberStats };
    picked.forEach(n => { if (n >= 1 && n <= 45) newStats[n] += 1; });
    setNumberStats(newStats);
  };

  const handleRandomLotto = () => {
    const arr: number[] = [];
    while (arr.length < 6) {
      const n = Math.floor(Math.random() * 45) + 1;
      if (!arr.includes(n)) arr.push(n);
    }
    arr.sort((a, b) => a - b);
    setRandomLotto(arr);
    setCopyMsg('');
  };

  const handleCopy = () => {
    if (combined.length === 0) return;
    navigator.clipboard.writeText(combined.join(', '));
    setCopyMsg('복사되었습니다!');
    setTimeout(() => setCopyMsg(''), 1200);
  };

  const handleCopyRandom = () => {
    if (randomLotto.length === 0) return;
    navigator.clipboard.writeText(randomLotto.join(', '));
    setCopyMsg('복사되었습니다!');
    setTimeout(() => setCopyMsg(''), 1200);
  };

  // 랭킹 계산
  const statsArr = Object.entries(numberStats).map(([num, cnt]) => ({ num: Number(num), cnt }));
  const top6 = statsArr.sort((a, b) => b.cnt - a.cnt || a.num - b.num).slice(0, 6);
  const bottom6 = statsArr.sort((a, b) => a.cnt - b.cnt || a.num - b.num).slice(0, 6);

  // 실제 로또 랭킹 조회
  const fetchLottoRank = async () => {
    setRealLoading(true);
    setRealError('');
    try {
      const res = await fetch(`/api/lotto-rank?count=${drawCount}`);
      const data = await res.json();
      setRealRank(data.top30);
      setRealLoading(false);
    } catch (e) {
      setRealError('로또 데이터 조회 실패');
      setRealLoading(false);
    }
  };

  // 최신 회차를 찾는 함수
  async function getLatestDrawNo(start = 1178) {
    let n = start;
    while (true) {
      const res = await fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${n}`);
      const data = await res.json();
      if (data.returnValue !== 'success') {
        // 직전 회차가 최신 회차
        return n - 1;
      }
      n++;
      // 안전장치: 너무 많이 반복하지 않도록
      if (n > start + 100) break;
    }
    return null;
  }

  const latestNo = async () => {
    const latestNo = await getLatestDrawNo(1178);
    // 이후 latestNo부터 drawCount만큼 반복 fetch
  };

  // 페이지 진입 시 기본적으로 랭킹 자동 조회
  useEffect(() => {
    fetchLottoRank();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawCount]);

  return (
    <main className={styles.main}>
      <div className={styles.lottoLayout}>
        {/* 많이 나온 번호 TOP 30 (왼쪽) */}
        <aside className={styles.rankSide}>
          <div className={styles.realRankBox}>
            <div style={{marginBottom:8}}>
              <label>조회 회차(최신 기준): </label>
              <input type="number" min={10} max={1000} value={drawCount} onChange={e => setDrawCount(Number(e.target.value))} className={styles.input} style={{width:80}} />
              <button className={styles.btn} style={{marginLeft:8}} onClick={fetchLottoRank}>조회</button>
            </div>
            {realLoading ? <div>로딩 중...</div> : realError ? <div style={{color:'red'}}>{realError}</div> : null}
          </div>
          <h3 className={styles.rankTitle}>많이 나온 번호 TOP 30</h3>
          <ol className={styles.rankList}>
            {realRank.map((x) => (
              <li key={x.num}>{x.num}번 ({x.cnt}회)</li>
            ))}
          </ol>
        </aside>
        {/* 메인 생성기/결과 */}
        <section className={styles.lottoMain}>
          <h1 className={styles.title}>로또번호 생성기</h1>
          <div className={styles.formBox}>
            {digitOptions.map((opt, idx) => (
              <div key={opt.label} className={styles.inputRow}>
                <label className={styles.label}>{opt.label}</label>
                <input
                  type="number"
                  min={0}
                  max={opt.countMax}
                  value={counts[idx]}
                  onChange={e => handleCountChange(idx, Number(e.target.value))}
                  className={styles.input}
                />
                <span className={styles.unit}>개</span>
              </div>
            ))}
            <button className={styles.btn} onClick={handleGenerate}>생성</button>
            <button className={styles.btn} style={{marginTop:8, background:'#5a4fff'}} onClick={handleRandomLotto}>랜덤 로또번호 생성</button>
          </div>
          <div className={styles.resultRow}>
            {/* 자릿수 조합 결과 */}
            <div className={styles.resultBox}>
              <h2 className={styles.resultTitle}>자릿수 조합 결과</h2>
              {combined.length > 0 && (
                <div style={{marginBottom:12}}>
                  <b>조합 결과:</b> {combined.join(', ')}
                  <button className={styles.copyBtn} onClick={handleCopy} style={{marginLeft:8}}>복사</button>
                </div>
              )}
              {copyMsg && !randomLotto.length && <div style={{color:'#5a4fff',marginBottom:8}}>{copyMsg}</div>}
              {results.every(arr => arr.length === 0) ? (
                <div className={styles.empty}>번호를 생성해 주세요.</div>
              ) : (
                <ul className={styles.resultList}>
                  {results.map((arr, idx) =>
                    arr.length > 0 ? (
                      <li key={idx}>
                        <b>{digitOptions[idx].label}:</b> {arr.join(', ')}
                      </li>
                    ) : null
                  )}
                </ul>
              )}
              {/* 랭킹 표시 */}
              <div className={styles.rankBox}>
                <div><b>자주 나오는 숫자 TOP 6:</b> {top6.map(x => `${x.num}(${x.cnt})`).join(', ')}</div>
                <div style={{marginTop:4}}><b>안 나오는 숫자 TOP 6:</b> {bottom6.map(x => `${x.num}(${x.cnt})`).join(', ')}</div>
              </div>
            </div>
            {/* 랜덤 로또번호 결과 */}
            <div className={styles.resultBox}>
              <h2 className={styles.resultTitle}>랜덤 로또번호</h2>
              {randomLotto.length > 0 ? (
                <div style={{marginBottom:12}}>
                  <b>랜덤 번호:</b> {randomLotto.join(', ')}
                  <button className={styles.copyBtn} onClick={handleCopyRandom} style={{marginLeft:8}}>복사</button>
                </div>
              ) : (
                <div className={styles.empty}>랜덤 번호를 생성해 주세요.</div>
              )}
              {copyMsg && randomLotto.length > 0 && <div style={{color:'#5a4fff',marginBottom:8}}>{copyMsg}</div>}
            </div>
          </div>
        </section>
        {/* 적게 나온 번호 TOP 30 (오른쪽) */}
        <aside className={styles.rankSide}>
          <h3 className={styles.rankTitle}>적게 나온 번호 TOP 30</h3>
          <ol className={styles.rankList}>
            {[...realRank].sort((a, b) => a.cnt - b.cnt || a.num - b.num).slice(0, 30).map((x) => (
              <li key={x.num}>{x.num}번 ({x.cnt}회)</li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  );
} 