'use client';
import React, { useState, useEffect } from 'react';
import styles from './lotto.module.css';
import axios from 'axios';


const apiClient = axios.create({
  //우분투용
  baseURL: 'https://smartpick.website/api',
  //윈도우용
  //baseURL: 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});


const digitOptions = [
  { label: '1', min: 0, max: 9, countMax: 10 },
  { label: '10', min: 10, max: 19, countMax: 10 },
  { label: '20', min: 20, max: 29, countMax: 10 },
  { label: '30', min: 30, max: 39, countMax: 10 },
  { label: '40', min: 40, max: 45, countMax: 6 },
];

export default function LottoPage() {
  const [counts, setCounts] = useState(Array(digitOptions.length).fill(0));
  const [results, setResults] = useState<number[][]>([]);
  const [combined, setCombined] = useState<number[]>([]);
  const [copyMsg, setCopyMsg] = useState('');
  const [randomLotto, setRandomLotto] = useState<number[]>([]);
  const [numberStats, setNumberStats] = useState<{ [num: number]: number }>(() => {
    const stats: { [num: number]: number } = {};
    for (let i = 1; i <= 45; i++) stats[i] = 0;
    return stats;
  });

  // 탭 상태
  const [activeTab, setActiveTab] = useState('numberRank');

  // 실제 로또 랭킹 관련 상태
  const [drawCount, setDrawCount] = useState(10); // 기본 최근 10회
  const [realRank, setRealRank] = useState<{ num: number, cnt: number }[]>([]);
  const [realLoading, setRealLoading] = useState(false);
  const [realError, setRealError] = useState('');

  // 자릿수 조합 랭킹 관련 상태
  const [digitRank, setDigitRank] = useState<{ combination: string, count: number }[]>([]);
  const [digitRankLoading, setDigitRankLoading] = useState(false);
  const [digitRankError, setDigitRankError] = useState('');

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
    let pool = Array.from({ length: 45 }, (_, i) => i + 1).filter(n => !picked.includes(n));
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
  const top6 = statsArr.sort((a, b) => b.cnt - a.cnt || a.num - b.num).slice(0, 45);
  const bottom6 = statsArr.sort((a, b) => a.cnt - b.cnt || a.num - b.num).slice(0, 45);


  //let urlpath='http://localhost:4000/api';
  let urlpath = 'https://smartpick.website/api';
  // 실제 로또 랭킹 조회
  const fetchLottoRank = async () => {
    setRealLoading(true);
    setRealError('');
    try {
      const res = await fetch(`${urlpath}/lotto-rank?count=${drawCount}`);
      // const res = await fetch(`https://smartpick.website/api/lotto-rank?count=${drawCount}`);
      const data = await res.json();
      setRealRank(data.top30);
      setRealLoading(false);
    } catch (e) {
      setRealError('로또 데이터 조회 실패');
      setRealLoading(false);
    }
  };

  // 자릿수 조합 랭킹 조회
  const fetchDigitRank = async () => {
    setDigitRankLoading(true);
    setDigitRankError('');
    try {
      const res = await fetch(`${urlpath}/lotto-digit-rank?count=${drawCount}`);
      const data = await res.json();
      if (data.digitRank && Array.isArray(data.digitRank)) {
        setDigitRank(data.digitRank);
      } else {
        setDigitRank([]);
        setDigitRankError('자릿수 조합 랭킹 데이터 형식 오류');
      }
      setDigitRankLoading(false);
    } catch (e) {
      setDigitRankError('자릿수 조합 랭킹 조회 실패');
      setDigitRankLoading(false);
      setDigitRank([]);
    }
  };

  // 자릿수 조합 계산 함수
  const calculateDigitCombination = (numbers: number[]) => {
    const digitCounts: { [digit: string]: number } = {
      '1': 0, '10': 0, '20': 0, '30': 0, '40': 0
    };

    numbers.forEach(num => {
      if (num >= 1 && num <= 9) digitCounts['1']++;
      else if (num >= 10 && num <= 19) digitCounts['10']++;
      else if (num >= 20 && num <= 29) digitCounts['20']++;
      else if (num >= 30 && num <= 39) digitCounts['30']++;
      else if (num >= 40 && num <= 45) digitCounts['40']++;
    });

    return digitCounts;
  };

  // DB에서 로또 번호 리스트 전체 불러오기
  async function fetchLottoList() {
    const res = await fetch(`${urlpath}/lotto/list`);
    return await res.json();
  }

  // DB에서 최신 회차 불러오기
  async function fetchLatestNo() {
    const res = await fetch(`${urlpath}/lotto/latest`);
    const data = await res.json();
    return data.latestNo;
  }

  // DB에 최신 회차 갱신 요청
  async function updateLottoDraws() {
    const res = await fetch(`${urlpath}/lotto/update`, { method: 'POST' });
    return await res.json();
  }

  // 페이지 컴포넌트 내부
  const [lottoList, setLottoList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      apiClient.post('/lotto/update', {});
      console.log('updateLottoDraws');
      let ret = await updateLottoDraws();
      console.log(ret);

      // 1. DB에서 로또 리스트 불러오기
      let list = await fetchLottoList();
      setLottoList(list);
      // 2. 최신 회차 확인 및 필요시 갱신
      const latestNo = list.length > 0 ? list[0].drawNo : 10;
      // 외부 최신 회차가 더 있으면 백엔드에 갱신 요청

      //const res = await fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${latestNo + 1}`);

      const params = new URLSearchParams({
        drwNo: latestNo,
      });


      const res = await fetch(`${urlpath}/lotto/req?${params}`);
      const data = await res.json();


      if (data.returnValue === 'success') {
        await updateLottoDraws();
        // 갱신 후 다시 리스트 불러오기
        list = await fetchLottoList();
        setLottoList(list);
      }
      setLoading(false);
    })();
  }, []);

  // 페이지 진입 시 기본적으로 랭킹 자동 조회
  useEffect(() => {
    fetchLottoRank();
    fetchDigitRank();

    apiClient.post('/visitors', { page: 'lotto', userAgent: navigator.userAgent });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawCount]);

  const getColorClass = (num) => {
    if (num < 10) return styles.yellow;
    if (num < 20) return styles.blue;
    if (num < 30) return styles.red;
    if (num < 40) return styles.gray;
    return styles.green;
  };

  return (
    <main className={styles.main}>
      <title>로또 번호 생성기 - 심풀</title>
      <div className={styles.lottoLayout}>
        {/* 메인 생성기/결과 */}
        <section className={styles.lottoMain}>
          <h1 className={styles.title}>Lotto 번호 생성기</h1>

          <h2 className={styles.resultTitle}>자릿수 조합 결과</h2>
          <div className={styles.formBox}>
            {digitOptions.map((opt, idx) => {
              const isRight = idx === 3 || idx === 4; // 4번, 5번 항목은 오른쪽 열
              const col = isRight ? 2 : 1;
              const row = isRight ? idx - 2 : idx + 1;

              return (
                <div
                  key={opt.label}
                  className={styles.inputRow}
                  style={{ gridColumn: col, gridRow: row }}
                >
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
              );
            })}

            {/* 버튼은 마지막 줄 가운데 정렬 */}
            <div style={{ gridColumn: '1 / span 2', gridRow: 4, textAlign: 'center' }}>
              <button className={styles.btn} onClick={handleGenerate}>생성</button>
            </div>
          </div>
          <div className={styles.resultRow}>
            {/* 자릿수 조합 결과 */}
            <div className={styles.resultBox}>
              <h2 className={styles.resultTitle}>자릿수 조합 결과</h2>
              {combined.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <b>조합 결과:</b> {combined.join(', ')}
                  <button className={styles.copyBtn} onClick={handleCopy} style={{ marginLeft: 8 }}>복사</button>
                </div>
              )}
              {copyMsg && !randomLotto.length && <div style={{ color: '#5a4fff', marginBottom: 8 }}>{copyMsg}</div>}
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
            </div>
          </div>
        </section>

        {/* 탭 컨테이너 */}
        <div className={styles.tabContainer}>
          <div className={styles.tabButtons}>
            <button
              className={`${styles.tabButton} ${activeTab === 'numberRank' ? styles.active : ''}`}
              onClick={() => setActiveTab('numberRank')}
            >
              번호 랭킹
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'digitRank' ? styles.active : ''}`}
              onClick={() => setActiveTab('digitRank')}
            >
              자릿수 조합 랭킹
            </button>
          </div>

          {/* 번호 랭킹 탭 */}
          <div className={`${styles.tabContent} ${activeTab === 'numberRank' ? styles.active : ''}`}>
            <section className={styles.lottoSub}>
              {/* 많이 나온 번호 TOP 30 (왼쪽) */}
              <aside className={styles.rankSide}>
                <div className={styles.realRankBox}>
                  <div style={{ marginBottom: 8 }}>
                    <label>조회 회차(최신 기준): </label>
                    <input type="number" min={10} max={1000} value={drawCount} onChange={e => setDrawCount(Number(e.target.value))} className={styles.input} style={{ width: 80 }} />
                    <button className={styles.btn} style={{ marginLeft: 8 }} onClick={fetchLottoRank}>조회</button>
                  </div>
                  {realLoading ? <div>로딩 중...</div> : realError ? <div style={{ color: 'red' }}>{realError}</div> : null}
                </div>
                <h3 className={styles.rankTitle}>많이 나온 랭킹</h3>
                <div className={styles.rankColumns}>
                  <ol className={styles.rankList}>
                    {realRank.slice(0, 23).map((x) => (
                      <li key={x.num} style={{ fontSize: 12 }}>
                        <span className={`${styles.circle} ${getColorClass(x.num)}`}>
                          {x.num}
                        </span> - ({x.cnt}회)
                      </li>
                    ))}
                  </ol>
                  <ol className={styles.rankList}>
                    {realRank.slice(23).map((x) => (
                      <li key={x.num} style={{ fontSize: 12 }}>
                        <span className={`${styles.circle} ${getColorClass(x.num)}`}>
                          {x.num}
                        </span> - ({x.cnt}회)
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>
              {/* 많이 나온 번호 TOP 30 (오른쪽) */}
              <aside className={styles.rankSide}>
                <div className={styles.realRankBox}>
                  <div style={{ marginBottom: 8 }}>
                  </div>
                  {realLoading ? <div>로딩 중...</div> : realError ? <div style={{ color: 'red' }}>{realError}</div> : null}
                </div>
                <h3 className={styles.rankTitle}>직접 생성한 번호 랭킹</h3>
                <div className={styles.rankColumns}>
                  <ol className={styles.rankList}>
                    {top6.slice(0, 23).map((x) => (
                      <li key={x.num} style={{ fontSize: 12 }}>
                        <span className={`${styles.circle} ${getColorClass(x.num)}`}>
                          {x.num}
                        </span> - ({x.cnt}회)
                      </li>
                    ))}
                  </ol>
                  <ol className={styles.rankList}>
                    {top6.slice(23).map((x) => (
                      <li key={x.num} style={{ fontSize: 12 }}>
                        <span className={`${styles.circle} ${getColorClass(x.num)}`}>
                          {x.num}
                        </span> - ({x.cnt}회)
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>
            </section>
          </div>

          {/* 자릿수 조합 랭킹 탭 */}
          <div className={`${styles.tabContent} ${activeTab === 'digitRank' ? styles.active : ''}`}>
            <div className={styles.digitRankContainer}>
              <div className={styles.digitRankSection}>
                <div style={{ marginBottom: 8, textAlign: 'center' }}>
                  <label>조회 회차(최신 기준): </label>
                  <input type="number" min={10} max={1000} value={drawCount} onChange={e => setDrawCount(Number(e.target.value))} className={styles.input} style={{ width: 80 }} />
                  <button className={styles.btn} style={{ marginLeft: 8 }} onClick={fetchDigitRank}>조회</button>
                </div>
                {digitRankLoading ? <div>로딩 중...</div> : digitRankError ? <div style={{ color: 'red' }}>{digitRankError}</div> : null}
                <h3 className={styles.digitRankTitle}>자릿수 조합 랭킹</h3>
                <ul className={styles.digitRankList}>
                  {Array.isArray(digitRank) && digitRank.map((item, index) => {
                    const hasNonZero = item.combination.split('-').some(count => count !== '0');
                    return (
                      <li
                        key={index}
                        className={styles.digitRankItem}
                        style={{
                          borderLeftColor: hasNonZero ? '#5a4fff' : '#ccc',
                          borderLeftWidth: hasNonZero ? '4px' : '2px',
                          display: 'flex',
                          flexDirection: 'column', // 수직 정렬
                          padding: '8px 0',
                          maxWidth: '500px',
                          minWidth: '320px',
                          width: '100%',
                        }}
                      >
                        <div style={{ display: 'flex', marginBottom: '4px' }}>
                          <div style={{ display: 'flex',fontWeight: 'bold', marginBottom: '4px' }}>

                            <span className={styles.rankNumber}>{index + 1}</span>
                            {/*  combination 문자열 */}
                            {item.combination}
                            {/* count 표시 */}
                            <span className={styles.digitRankCount}>{item.count}회</span>
                          </div>
                        </div>
                        {/* 두 번째 줄: 기존 flex 구조 */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className={styles.digitCombination} style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                              {item.combination.split('-').map((count, idx) => {
                                const labels = ['1', '10', '20', '30', '40'];
                                const isZero = count === '0';
                                return (

                                  <div
                                    key={idx}
                                    className={styles.digitGroup}
                                    style={{
                                      borderColor: isZero ? '#ccc' : '#5a4fff',
                                      borderWidth: isZero ? '1px' : '2px',
                                    }}
                                  >
                                    <span className={`${styles.circle} ${getColorClass(labels[idx])}`}>
                                      {labels[idx]}
                                    </span>{count}회
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 