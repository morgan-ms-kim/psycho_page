import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Link from 'next/link';
import ThumbnailUploader from '../../components/ThumbnailUploader';

const apiClient = axios.create({
  baseURL: 'https://smartpick.website/api',
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
      // 히스토리를 완전히 초기화하고 로그인 페이지로 강제 이동
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// 경로 확인 및 수정 유틸리티 함수
const validateAndFixPath = (path, router) => {
  // 현재 경로 확인
  const currentPath = router.asPath;
  const basePath = '/admin';
  
  // 중복 경로 확인
  if (currentPath.includes(`${basePath}${basePath}`)) {
    console.warn('중복 경로 감지:', currentPath);
    // 중복 제거
    const cleanPath = currentPath.replace(`${basePath}${basePath}`, basePath);
    router.replace(cleanPath);
    return false;
  }
  
  // 올바른 경로인지 확인
  if (!currentPath.startsWith(basePath) && currentPath !== '/') {
    console.warn('잘못된 경로 감지:', currentPath);
    // 올바른 경로로 리다이렉트
    router.replace(`${basePath}${path}`);
    return false;
  }
  
  return true;
};

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
  const [serverStatus, setServerStatus] = useState('checking');
  const [progressSteps, setProgressSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState('');
  const [logMessages, setLogMessages] = useState([]);
  const logPanelRef = useRef(null);

  // 서버 상태 확인
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await apiClient.get('/health');
        console.log('서버 상태:', response.data);
        setServerStatus('ok');
        
        // 데이터베이스 상태도 확인
        const dbResponse = await apiClient.get('/db-status');
        console.log('데이터베이스 상태:', dbResponse.data);
      } catch (error) {
        console.error('서버 상태 확인 실패:', error);
        setServerStatus('error');
        setError('서버에 연결할 수 없습니다. 관리자에게 문의하세요.');
      }
    };
    
    checkServerStatus();
  }, []);

  const showMessage = (message, type = 'info') => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 3000);
  };

  const addProgressStep = (step, status = 'pending') => {
    setProgressSteps(prev => [...prev, { step, status, timestamp: new Date() }]);
  };

  const updateProgressStep = (step, status) => {
    setProgressSteps(prev => 
      prev.map(p => p.step === step ? { ...p, status } : p)
    );
  };

  // 로그 추가 함수
  const addLog = (msg) => {
    setLogMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    setTimeout(() => {
      if (logPanelRef.current) {
        logPanelRef.current.scrollTop = logPanelRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setProgressSteps([]);
    setLogMessages([]);
    addLog('테스트 추가 시작');

    // 입력값 검증
    if (!formData.gitUrl.trim()) {
      setError('Git 저장소 URL을 입력해주세요.');
      setLoading(false);
      return;
    }

    if (!formData.title.trim()) {
      setError('테스트 제목을 입력해주세요.');
      setLoading(false);
      return;
    }

    // Git URL 형식 검증
    const gitUrlPattern = /^https:\/\/(github\.com|gitlab\.com)\/[^\/]+\/[^\/]+\.git$/;
    if (!gitUrlPattern.test(formData.gitUrl)) {
      setError('올바른 GitHub 또는 GitLab 저장소 URL을 입력해주세요. (예: https://github.com/username/repository.git)');
      setLoading(false);
      return;
    }

    // 진행 단계 초기화
    const steps = [
      'Git 저장소 클론',
      'package.json 수정',
      '의존성 설치',
      '테스트 빌드',
      '데이터베이스 저장'
    ];

    steps.forEach(step => addProgressStep(step));

    try {
      addLog('API 요청: 테스트 등록');
      addLog('Git URL: ' + formData.gitUrl);
      addLog('제목: ' + formData.title);
      console.log('🔄 테스트 추가 시작:', formData);
      setCurrentStep('테스트 추가 중...');
      
      const response = await apiClient.post('/admin/tests/add', formData, { timeout: 300000 });
      addLog('API 응답: ' + JSON.stringify(response.data));
      
      console.log('✅ 테스트 추가 성공:', response.data);
      
      // 진행 단계 업데이트
      if (response.data.steps) {
        if (response.data.steps.directoryCreated) {
          updateProgressStep('Git 저장소 클론', 'completed');
          addLog('✅ 디렉토리 생성 완료');
        }
        if (response.data.steps.gitCloned) {
          updateProgressStep('Git 저장소 클론', 'completed');
          addLog('✅ Git 클론 완료');
        }
        if (response.data.steps.packageJsonModified) {
          updateProgressStep('package.json 수정', 'completed');
          addLog('✅ package.json 수정 완료');
          addLog('📦 homepage 필드 추가/업데이트 완료');
        }
        if (response.data.steps.npmInstalled) {
          updateProgressStep('의존성 설치', 'completed');
          addLog('✅ 의존성 설치 완료');
        }
        if (response.data.steps.buildCompleted) {
          updateProgressStep('테스트 빌드', 'completed');
          addLog('✅ 빌드 완료');
        }
        if (response.data.steps.databaseSaved) {
          updateProgressStep('데이터베이스 저장', 'completed');
          addLog('✅ 데이터베이스 저장 완료');
        }
      }
      
      // 썸네일 업로드
      if (thumbnailFile && response.data.test) {
        setCurrentStep('썸네일 업로드 중...');
        addProgressStep('썸네일 업로드');
        
        addLog('API 요청: 썸네일 업로드');
        addLog('파일명: ' + thumbnailFile.name);
        addLog('파일 크기: ' + (thumbnailFile.size / 1024).toFixed(2) + 'KB');
        addLog('파일 타입: ' + thumbnailFile.type);
        
        const formDataThumbnail = new FormData();
        formDataThumbnail.append('thumbnail', thumbnailFile);
        
        try {
          const thumbnailResponse = await apiClient.post(`/admin/tests/${response.data.test.id}/thumbnail`, formDataThumbnail, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 120000 // 120초 타임아웃
          });
          
          updateProgressStep('썸네일 업로드', 'completed');
          addLog('✅ 썸네일 업로드 성공');
          addLog('썸네일 경로: ' + thumbnailResponse.data.thumbnail);
          addLog('썸네일 URL: https://smartpick.website' + thumbnailResponse.data.thumbnail);
        } catch (thumbnailError) {
          updateProgressStep('썸네일 업로드', 'failed');
          addLog('❌ 썸네일 업로드 실패: ' + (thumbnailError.response?.data?.error || thumbnailError.message));
          addLog('❌ 에러 상세: ' + JSON.stringify(thumbnailError.response?.data || thumbnailError.message));
          addLog('⚠️ 썸네일 업로드 실패했지만 테스트 등록은 완료되었습니다.');
          console.error('썸네일 업로드 실패:', thumbnailError);
        }
      } else {
        addLog('ℹ️ 썸네일 파일이 선택되지 않았습니다.');
      }
      
      setCurrentStep('완료!');
      addLog('🎉 테스트 추가 완료!');
      showMessage('테스트가 성공적으로 추가되었습니다!', 'success');
      
      // 테스트 등록 완료 후 해당 테스트 페이지로 이동
      const folderName = response.data.folderName || `test${response.data.test.id}`;
      const testUrl = `/tests/${folderName}/`;
      addLog('🔗 테스트 페이지: ' + testUrl);
      
      // 3초 후 테스트 페이지로 이동
      setTimeout(() => {
        window.open(testUrl, '_blank'); // 새 탭에서 테스트 페이지 열기
        if (validateAndFixPath('/tests', router)) {
          router.push('/tests'); // 관리자 목록 페이지로 이동
        }
      }, 3000);
      
    } catch (error) {
      console.error('테스트 추가 실패:', error);
      setCurrentStep('오류 발생');
      
      // 에러 상세 정보 로깅
      addLog('❌ 테스트 추가 실패');
      addLog('에러 메시지: ' + (error.response?.data?.error || error.message));
      if (error.response?.data?.detail) {
        addLog('상세 정보: ' + error.response.data.detail);
      }
      if (error.response?.data?.command) {
        addLog('실행 명령어: ' + error.response.data.command);
      }
      
      // 진행 중인 단계를 실패로 표시
      const currentStepIndex = progressSteps.findIndex(p => p.status === 'pending');
      if (currentStepIndex !== -1) {
        updateProgressStep(progressSteps[currentStepIndex].step, 'failed');
      }
      
      const errorMessage = error.response?.data?.error || '테스트 추가에 실패했습니다.';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    // 히스토리를 완전히 초기화하고 로그인 페이지로 강제 이동
    window.location.href = '/admin';
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo onClick={() => {
            if (router.pathname !== '/dashboard') {
              if (validateAndFixPath('/dashboard', router)) {
                router.push('/dashboard');
              }
            }
          }} style={{ cursor: 'pointer' }}>🧠 PSYCHO</Logo>
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
          <PageTitle>새 테스트 추가</PageTitle>
          <BackButton href="/tests">← 목록으로</BackButton>
        </PageHeader>

        <FormCard>
          {serverStatus === 'checking' && (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
              서버 상태 확인 중...
            </div>
          )}
          {serverStatus === 'error' && (
            <ErrorMessage>
              ⚠️ 서버에 연결할 수 없습니다. 관리자에게 문의하세요.
            </ErrorMessage>
          )}
          
          {/* 진행 상황 표시 */}
          {loading && progressSteps.length > 0 && (
            <ProgressContainer>
              <ProgressTitle>{currentStep}</ProgressTitle>
              <ProgressSteps>
                {progressSteps.map((step, index) => (
                  <ProgressStep key={index} status={step.status}>
                    <StepIcon>
                      {step.status === 'completed' && '✅'}
                      {step.status === 'failed' && '❌'}
                      {step.status === 'pending' && '⏳'}
                    </StepIcon>
                    <StepText>{step.step}</StepText>
                  </ProgressStep>
                ))}
              </ProgressSteps>
              <LogPanel ref={logPanelRef}>
                {logMessages.map((msg, idx) => (
                  <div key={idx} style={{ fontSize: '0.95em', color: '#444' }}>{msg}</div>
                ))}
              </LogPanel>
            </ProgressContainer>
          )}
          
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
              <ThumbnailUploader
                testId="new"
                testTitle="새 테스트"
                onImageChange={(file) => setThumbnailFile(file)}
              />
              <HelpText>
                테스트를 대표할 썸네일 이미지를 선택하세요. (선택사항)
              </HelpText>
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <ButtonGroup>
              <CancelButton type="button" onClick={() => {
                if (validateAndFixPath('/tests', router)) {
                  router.push('/tests');
                }
              }}>
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
  font-family: 'Fira Sans', sans-serif;
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

const ProgressContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ProgressTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
`;

const ProgressSteps = styled.ul`
  list-style: none;
  padding: 0;
`;

const ProgressStep = styled.li`
  color: ${props => props.status === 'completed' ? '#28a745' : props.status === 'failed' ? '#e74c3c' : '#666'};
  padding: 0.5rem 0;
  border-bottom: ${props => props.status === 'completed' ? '1px solid #28a745' : props.status === 'failed' ? '1px solid #e74c3c' : 'none'};

  &:last-child {
    border-bottom: none;
  }
`;

const StepIcon = styled.div`
  font-size: 1rem;
  margin-right: 0.5rem;
`;

const StepText = styled.span`
  font-size: 1rem;
`;

const LogPanel = styled.div`
  background: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 1rem;
  max-height: 180px;
  overflow-y: auto;
  font-family: 'Fira Mono', 'Consolas', monospace;
`; 