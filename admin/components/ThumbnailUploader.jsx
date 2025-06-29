import { useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://smartpick.website/psycho_page/api',
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
  return config;
});

export default function ThumbnailUploader({ testId, testTitle, onUploadSuccess, onUploadError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 형식 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      setSelectedFile(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('업로드할 파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('thumbnail', selectedFile);

    try {
      const response = await apiClient.post(`/admin/tests/${testId}/thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
        timeout: 60000 // 60초 타임아웃
      });

      console.log('썸네일 업로드 성공:', response.data);
      onUploadSuccess?.(response.data.thumbnail);
      
      // 성공 후 초기화
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('썸네일 업로드 실패:', error);
      const errorMessage = error.response?.data?.error || error.message || '업로드에 실패했습니다.';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container>
      <Title>썸네일 업로드</Title>
      <Subtitle>테스트: {testTitle}</Subtitle>

      <UploadArea>
        <FileInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        
        {!selectedFile && (
          <UploadPrompt>
            <UploadIcon>📁</UploadIcon>
            <UploadText>클릭하여 이미지 파일을 선택하세요</UploadText>
            <UploadHint>지원 형식: JPG, PNG, GIF, WebP (최대 5MB)</UploadHint>
          </UploadPrompt>
        )}

        {previewUrl && (
          <PreviewContainer>
            <PreviewImage src={previewUrl} alt="미리보기" />
            <PreviewInfo>
              <FileInfo>파일명: {selectedFile?.name}</FileInfo>
              <FileInfo>크기: {(selectedFile?.size / 1024).toFixed(2)} KB</FileInfo>
              <FileInfo>타입: {selectedFile?.type}</FileInfo>
            </PreviewInfo>
          </PreviewContainer>
        )}

        {uploading && (
          <ProgressContainer>
            <ProgressBar>
              <ProgressFill progress={uploadProgress} />
            </ProgressBar>
            <ProgressText>{uploadProgress}% 업로드 중...</ProgressText>
          </ProgressContainer>
        )}
      </UploadArea>

      <ButtonGroup>
        {selectedFile && !uploading && (
          <>
            <RemoveButton onClick={handleRemoveFile}>
              ❌ 파일 제거
            </RemoveButton>
            <UploadButton onClick={handleUpload}>
              📤 썸네일 업로드
            </UploadButton>
          </>
        )}
      </ButtonGroup>
    </Container>
  );
}

const Container = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
`;

const UploadArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #667eea;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadPrompt = styled.div`
  cursor: pointer;
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const UploadHint = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const PreviewContainer = styled.div`
  margin-top: 1rem;
`;

const PreviewImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 10px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PreviewInfo = styled.div`
  text-align: left;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
`;

const FileInfo = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #666;
`;

const ProgressContainer = styled.div`
  margin-top: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const UploadButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;

  &:hover {
    background: #5a6fd8;
  }
`;

const RemoveButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;

  &:hover {
    background: #c0392b;
  }
`; 