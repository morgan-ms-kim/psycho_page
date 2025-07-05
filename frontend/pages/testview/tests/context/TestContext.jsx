import React, { createContext, useContext, useState } from 'react';

// TestContext 생성
const TestContext = createContext();

// TestProvider 컴포넌트
export const TestProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 사용자 상태 관리

  const value = {
    user,
    setUser,
  };

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
};

// useTestContext 훅
export const useTestContext = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTestContext must be used within a TestProvider');
  }
  return context;
};
