import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Link from 'next/link';

const apiClient = axios.create({
  baseURL: 'https://smartpick.website/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터로 토큰 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터로 인증 오류 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

export default function EditTest() {
  const router = useRouter();
  const { id } = router.query;
  const [test, setTest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '기타'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadTest();
    }
  }, [id]);

  const loadTest = async () => {
    try {
      const response = await apiClient.get(`/admin/tests/${id}`);
      setTest(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description,
        category: response.data.category || '기타'
      });
    } catch (error) {
      console.error('테스트 로드 실패:', error);
      setError('테스트를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await apiClient.put(`/admin/tests/${id}`, formData);
      setMessage('테스트가 성공적으로 수정되었습니다!');
      
      // 3초 후 목록으로 이동
      setTimeout(() => {
        router.push('/tests');
      }, 3000);
    } catch (error) {
      console.error('테스트 수정 실패:', error);
      setError('테스트 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/');
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>로딩 중...</LoadingMessage>
      </Container>
    );
  }

  if (error && !test) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
        <BackButton onClick={() => router.push('/tests')}>
          목록으로 돌아가기
        </BackButton>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
            🧠 PSYCHO
          </Logo>
          <Nav>
            <NavLink href="/dashboard">대시보드</NavLink>
            <NavLink href="/tests">테스트 관리</NavLink>
            <NavLink href="/analytics">방문자 분석</NavLink>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </Nav>
        </HeaderContent>
      </Header>

      <Main>
        <PageHeader>
          <PageTitle>테스트 수정</PageTitle>
          <BackButton onClick={() => router.push('/tests')}>
            ← 목록으로
          </BackButton>
        </PageHeader>

        {message && <SuccessMessage>{message}</SuccessMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {test && (
          <FormCard>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>제목</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="테스트 제목을 입력하세요"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>설명</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="테스트 설명을 입력하세요"
                  rows="4"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>카테고리</Label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="성격">성격</option>
                  <option value="연애">연애</option>
                  <option value="직업">직업</option>
                  <option value="취미">취미</option>
                  <option value="지능">지능</option>
                  <option value="사회성">사회성</option>
                  <option value="기타">기타</option>
                </Select>
              </FormGroup>

              <ButtonGroup>
                <CancelButton type="button" onClick={() => router.push('/tests')}>
                  취소
                </CancelButton>
                <SubmitButton type="submit" disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </SubmitButton>
              </ButtonGroup>
            </Form>
          </FormCard>
        )}
      </Main>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #667eea;
  }
`;

const LogoutButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #c0392b;
  }
`;

const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #5a6268;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const FormCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
    border-color: #667eea;
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  -ms-appearance: none !important;
  background: #fff !important;
  color: #222 !important;
  border: 1.5px solid #d1c4e9 !important;
  border-radius: 8px !important;
  font-size: 1rem;
  min-width: 110px;
  padding: 0.75rem 1.2rem !important;
  font-family: inherit;
  font-weight: 500;
  outline: none !important;
  transition: border-color 0.3s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(80,80,120,0.07);
  cursor: pointer;

  &:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 2px #ede7f6;
  }

  &::-ms-expand {
    display: none;
  }

  option {
    background: #fff;
    color: #222;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #5a6268;
  }
`;

const SubmitButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background: #5a6fd8;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;