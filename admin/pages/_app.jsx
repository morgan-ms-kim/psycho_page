import { createGlobalStyle } from 'styled-components';
import { useEffect } from 'react';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f5f5f5;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* styled-components hydration 오류 방지 */
  .styled-components-hydration-fix {
    display: none;
  }
`;

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Fast Refresh 비활성화
    if (typeof window !== 'undefined') {
      window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
      window.__NEXT_DATA__.dev = false;
    }
  }, []);

  return (
    <>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 