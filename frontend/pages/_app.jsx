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