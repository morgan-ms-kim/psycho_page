import { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Link from 'next/link';

const apiClient = axios.create({
  baseURL: 'https://smartpick.website/api',
  timeout: 30000,
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
  console.log('API 요청:', config.method?.toUpperCase(), config.url, config.data);
  return config;
});

// 응답 인터셉터로 인증 오류 처리
apiClient.interceptors.response.use(
  (response) => {
    console.log('API 응답 성공:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API 응답 오류:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/psycho_page/admin';
    }
    return Promise.reject(error);
  }
);

export default function AddTest() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    gitUrl: '',
    title: '',
    description: '',
    category: '기타'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info');

  const showMessage = (message, type = 'info') => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/admin/tests', formData);
      
      // 썸네일 업로드
      if (thumbnailFile && response.data.test) {
        const formDataThumbnail = new FormData();
        formDataThumbnail.append('thumbnail', thumbnailFile);
        
        await apiClient.post(`/admin/tests/${response.data.test.id}/thumbnail`, formDataThumbnail, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      }
      
      showMessage('테스트가 성공적으로 추가되었습니다!');
      router.push('/psycho_page/admin/tests');
    } catch (error) {
      console.error('테스트 추가 실패:', error);
      setError(error.response?.data?.error || '테스트 추가에 실패했습니다.');
      showMessage(error.response?.data?.error || '테스트 추가에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/');
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>🧠 PSYCHO</Logo>
          <Nav>
            <NavLink href="/psycho_page/admin/dashboard">대시보드</NavLink>
            <NavLink href="/psycho_page/admin/tests">테스트 관리</NavLink>
            <NavLink href="/psycho_page/admin/analytics">방문자 분석</NavLink>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </Nav>
        </HeaderContent>
      </Header>

      <Main>
        <PageHeader>
          <PageTitle>새 테스트 추가</PageTitle>
          <BackButton href="/tests">← 목록으로</BackButton>
        </PageHeader>

        <FormCard>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Git 저장소 URL *</Label>
              <Input
                type="url"
                value={formData.gitUrl}
                onChange={(e) => setFormData({...formData, gitUrl: e.target.value})}
                placeholder="https://github.com/username/repository.git"
                required
              />
              <HelpText>
                React/Next.js 테스트가 포함된 Git 저장소 URL을 입력하세요.
              </HelpText>
            </FormGroup>

            <FormGroup>
              <Label>테스트 제목 *</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="테스트 제목을 입력하세요"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>테스트 설명</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="테스트에 대한 설명을 입력하세요"
                rows={4}
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

            <FormGroup>
              <Label>썸네일 이미지</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files[0])}
              />
              <HelpText>
                테스트를 대표할 썸네일 이미지를 선택하세요. (선택사항)
              </HelpText>
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <ButtonGroup>
              <CancelButton type="button" onClick={() => router.push('/tests')}>
                취소
              </CancelButton>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? '추가 중...' : '테스트 추가'}
              </SubmitButton>
            </ButtonGroup>
          </Form>
        </FormCard>

        <InfoCard>
          <InfoTitle>📋 추가 과정</InfoTitle>
          <InfoList>
            <InfoItem>1. Git 저장소에서 테스트 코드를 클론합니다</InfoItem>
            <InfoItem>2. package.json에 homepage 설정을 추가합니다</InfoItem>
            <InfoItem>3. npm install로 의존성을 설치합니다</InfoItem>
            <InfoItem>4. npm run build로 테스트를 빌드합니다</InfoItem>
            <InfoItem>5. 데이터베이스에 테스트 정보를 저장합니다</InfoItem>
          </InfoList>
        </InfoCard>
      </Main>
      
      {/* 팝업 모달 */}
      {showModal && (
        <Modal type={modalType}>
          <ModalContent>
            <ModalIcon>
              {modalType === 'success' && '✅'}
              {modalType === 'error' && '❌'}
              {modalType === 'info' && 'ℹ️'}
            </ModalIcon>
            <ModalMessage>{modalMessage}</ModalMessage>
          </ModalContent>
        </Modal>
      )}
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

const BackButton = styled(Link)`
  color: #667eea;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const FormCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
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
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const HelpText = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  flex: 1;

  &:hover {
    background: #5a6268;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  flex: 2;
  transition: transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
  background: #fdf2f2;
  border-radius: 5px;
`;

const InfoCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
`;

const InfoItem = styled.li`
  color: #666;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  text-align: center;
`;

const ModalIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const ModalMessage = styled.p`
  font-size: 1rem;
  color: #333;
`; 