import '../styles/globals.css';
import { ThemeProvider } from 'styled-components';
import Head from 'next/head';
import { useEffect } from 'react';

const theme = {
  colors: {
    primary: '#ff5e5e',
    secondary: '#ffe066',
    background: '#fffbe7',
    accent: '#6c63ff',
    retro: '#00e0ca',
    cute: '#ffb3e6',
  },
  borderRadius: '16px',
};

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // 카카오 광고 로드 함수
    const loadKakaoAd = () => {
      try {
        const isPC = window.matchMedia('(min-width: 728px)').matches;
        const adUnit = isPC ? 'DAN-NOAbzxQGMUQ8Mke7' : 'DAN-gNGXA6EnAXz8usSK';
        const adWidth = isPC ? '728' : '320';
        const adHeight = isPC ? '90' : '100';
        
        // 기존 광고 컨테이너 확인
        let container = document.getElementById('kakao-ad-container');
        if (!container) {
          // 컨테이너가 없으면 생성
          container = document.createElement('div');
          container.id = 'kakao-ad-container';
          container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            min-height: ${adHeight}px;
          `;
          document.body.appendChild(container);
        }
        
        // 기존 광고 제거
        container.innerHTML = '';
        
        // 새 광고 요소 생성
        const adElement = document.createElement('ins');
        adElement.className = 'kakao_ad_area kakao-ad-fixed';
        adElement.style.display = 'none';
        adElement.setAttribute('data-ad-unit', adUnit);
        adElement.setAttribute('data-ad-width', adWidth);
        adElement.setAttribute('data-ad-height', adHeight);
        
        // 광고 스크립트 생성
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = '//t1.daumcdn.net/kas/static/ba.min.js';
        scriptElement.async = true;
        
        // DOM에 추가
        container.appendChild(adElement);
        container.appendChild(scriptElement);
        
        console.log('카카오 광고 로드 완료:', adUnit);
      } catch (error) {
        console.error('카카오 광고 로드 실패:', error);
      }
    };
    
    // 페이지 로드 완료 후 광고 로드
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadKakaoAd);
    } else {
      loadKakaoAd();
    }
    
    // 화면 크기 변경 시 광고 다시 로드
    const handleResize = () => {
      setTimeout(loadKakaoAd, 100);
    };
    window.addEventListener('resize', handleResize);
    
    // 3초 후에도 광고가 로드되지 않으면 다시 시도
    setTimeout(() => {
      const adElement = document.querySelector('.kakao_ad_area');
      if (!adElement || adElement.style.display === 'none') {
        console.log('광고 재로드 시도');
        loadKakaoAd();
      }
    }, 3000);
    
    // 클린업 함수
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <style jsx global>{`
          .kakao-ad-fixed {
            position: relative;
            display: block !important;
          }
          @media (max-width: 727px) {
            #kakao-ad-container {
              min-height: 100px;
            }
          }
        `}</style>
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

// styled-components SSR 설정
if (typeof window !== 'undefined') {
  const { createGlobalStyle } = require('styled-components');
  
  const GlobalStyle = createGlobalStyle`
    * {
      box-sizing: border-box;
    }
    
    html,
    body {
      padding: 0;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
        Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    }
    
    a {
      color: inherit;
      text-decoration: none;
    }
  `;
} 