// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext'; // AuthProvider 임포트
import Main from './components/Main';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ChatbotPage from './components/ChatbotPage';
import MyPage from './components/MyPage';
import InfoPage from './components/InfoPage';
import QuizPage from './components/QuizPage';

import Test_chat from './components/test_chat'

function App() {
  const { currentUser } = useAuth();  // 인증 상태 가져오기

  return (
    <Router>
      <Routes>
        {/* 기본적으로 Main 페이지가 보여짐 */}
        <Route path="/" element={<Main />} />  
        
        {/* 로그인 여부와 관계없이 접근 가능한 페이지들 */}
        <Route path="/main" element={<Main />} /> 
        <Route path="/loginPage" element={<LoginPage />} />
        <Route path="/registerPage" element={<RegisterPage />} />
        <Route path="/chatbotPage" element={<Test_chat />} />
        <Route path="/infoPage" element={<InfoPage />} />
        <Route path="/quizPage" element={<QuizPage />} />

        {/* 로그인된 사용자만 접근 가능한 페이지 */}
        <Route path="/myPage" element={<MyPage />} />
      </Routes>
    </Router>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
