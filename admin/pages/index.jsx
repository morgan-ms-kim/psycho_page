import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';

import Image from 'next/image';
const apiClient = axios.create({
  baseURL: 'https://smartpick.website/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 경로 확인 및 수정 유틸리티 함수
const validateAndFixPath = (path, router) => {
  // 현재 경로 확인
  const currentPath = router.asPath;
  const basePath = '/admin';
  
  console.log('현재 경로:', currentPath);
  
  // 중복 경로 확인 (더 정확한 패턴 매칭)
  if (currentPath.includes('/admin/admin')) {
    console.warn('중복 경로 감지:', currentPath);
    // 중복 제거하고 올바른 경로로 리다이렉트
    const cleanPath = currentPath.replace('/admin/admin', basePath);
    console.log('수정된 경로:', cleanPath);
    router.replace(cleanPath);
    return false;
  }
  
  // 올바른 경로인지 확인
  if (!currentPath.startsWith(basePath) && currentPath !== '/') {
    console.warn('잘못된 경로 감지:', currentPath);
    // 올바른 경로로 리다이렉트
    const correctPath = `${basePath}${path}`;
    console.log('올바른 경로로 리다이렉트:', correctPath);
    router.replace(correctPath);
    return false;
  }
  
  return true;
};

export default function AdminLogin() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 경로 검증 및 수정
    validateAndFixPath('/', router);
    
    // 이미 로그인된 경우 대시보드로 이동
    const token = localStorage.getItem('adminToken');
    if (token) {
      // 히스토리를 완전히 초기화하고 대시보드로 강제 이동
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/admin/login', credentials);
      localStorage.setItem('adminToken', response.data.token);
      // 히스토리를 완전히 초기화하고 대시보드로 강제 이동
      router.push('/dashboard');
    } catch (error) {
      console.error('로그인 실패:', error);
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <Logo> <Image src="/uploads/logo.png" alt="심풀 로고"
                        layout="fixed" width={35} height={35} style={{ verticalAlign: 'middle' }} />
                   심풀</Logo>
          <Title>관리자 로그인</Title>
        </LoginHeader>

        <LoginForm onSubmit={handleLogin}>
          <FormGroup>
            <Label>아이디</Label>
            <Input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              placeholder="관리자 아이디를 입력하세요"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>비밀번호</Label>
            <Input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <LoginButton type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </LoginButton>
        </LoginForm>
      </LoginCard>
    </LoginContainer>
  );
}

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6a5acd 0%, #764ba2 100%);
  @media (max-width: 600px) {
    padding: 0;
    min-height: 100vh;
  }
`;

const LoginCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  @media (max-width: 600px) {
    max-width: 98vw;
    min-width: 0;
    padding: 1rem 0.5rem;
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #6a5acd;
  margin-bottom: 0.5rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #6a5acd;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
  text-align: center;
`;

const LoginButton = styled.button`
  background: #6a5acd;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background: #5a6fd8;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;