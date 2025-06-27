import '../styles/globals.css';
import { ThemeProvider } from 'styled-components';

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
  return (
    <ThemeProvider theme={theme}>
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