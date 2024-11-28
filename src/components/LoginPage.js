// src/components/LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';  // 'Link' import 추가

import '../styles/LoginPage.css';
import '../styles/Basic.css';

import appleLogo from '../assets/images/apple_logo.png';
import googleLogo from '../assets/images/google_logo.png';
import kakaoLogo from '../assets/images/kakao_logo.png';
import mainLogo from '../assets/images/mainLogo.png';

function LoginPage() {
  const [userInfo, setUserInfo] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(userInfo.email, userInfo.password);
      console.log('로그인 성공');
      navigate('/main'); // 로그인 후 메인 페이지로 이동
    } catch (error) {
      console.error('로그인 실패: ', error.message);
    }
  };

  return (
    <div className="login-container">
      {/* 상단 헤더 영역 */}
      <div className="header">
        <div className="header-logo">
          <a href="/main">ROBOBUDDY</a>
        </div>
        <div className="header-links">
          <a href="/infoPage">Info</a>
          <a href="/quizPage">Quiz</a>
        </div>
      </div>

      <div className="login-content">
        <div className="logo">
          <img src={mainLogo} alt="Main Logo" className="logo-image" />
          <div className="login-logo-text">ROBOBUDDY</div>
        </div>


        <form className="login-form" onSubmit={handleLoginSubmit}>
          <input 
          type="email" 
          placeholder="E-mail" 
          value={userInfo.email}
          onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
          className="input-field" />

          <input 
          type="password" 
          placeholder="Password" 
          value={userInfo.password}
          onChange={(e) => setUserInfo({...userInfo, password: e.target.value})}
          className="input-field" />

          <button type="submit" className="login-button">LOGIN</button>
          <Link to="/registerPage" className="register-button-link">
            <button type="button" className="register-button">REGISTER</button>
          </Link>

          <div className="social-login">
            <div className="divider">
              <span>Or log in with</span>
            </div>
            <div className="social-icons">
              <button className="social-icon">
                <img src={appleLogo} alt="Apple Login" className="icon-image" />
              </button>
              <button className="social-icon">
                <img src={googleLogo} alt="Google Login" className="icon-image" />
              </button>
              <button className="social-icon">
                <img src={kakaoLogo} alt="Kakao Login" className="icon-image" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
