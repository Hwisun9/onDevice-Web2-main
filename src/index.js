// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';      // 전역 스타일 임포트
import App from './App';   // App 컴포넌트 임포트

const root = ReactDOM.createRoot(document.getElementById('root'));  // 'root'에 React DOM 연결
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
