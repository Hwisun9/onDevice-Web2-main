import React, { useState, useEffect } from 'react';
import '../styles/Basic.css'
import '../styles/QuizPage.css'

import { Link, useNavigate } from 'react-router-dom';  // 'Link' import 추가
import { useAuth } from '../AuthContext';

import Modal from './Modal';
import { useModal } from '../hooks/useModal';

import quizImage from '../assets/images/quiz_image.png'


function App() {
    const questions = [
        { question: "React는 JavaScript 라이브러리이다.", answer: "O" },
        { question: "Java는 JavaScript와 동일한 언어이다.", answer: "X" },
        { question: "HTML은 프로그래밍 언어이다.", answer: "X" },
        { question: "CSS는 웹 페이지 스타일을 정의한다.", answer: "O" },
    ];

    const { currentUser, logout } = useAuth();
    const { modalMessage, isModalOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 랜덤으로 문제 선택
    const getRandomQuestion = () => {
        const randomIndex = Math.floor(Math.random() * questions.length);
        return questions[randomIndex];
    };

     // 상태 관리: 랜덤 문제
     const [currentQuestion, setCurrentQuestion] = useState(getRandomQuestion());


    // O/X 버튼 클릭 시
    const handleAnswer = (answer) => {
        if (answer === currentQuestion.answer) {
            openModal("정답!");
        } else {
            openModal("오답!");
        }
        // 새로운 문제로 이동
        setCurrentQuestion(getRandomQuestion());
    };

    // 로그인 후 UI 전환이 자연스럽게 이루어지도록 useEffect 사용
    useEffect(() => {
        if (currentUser) {
            setLoading(false); // 로그인 성공 시 로딩 해제
        }
    }, [currentUser]);
    return (
        
        <div class="quiz">
            {isModalOpen && <Modal message={modalMessage} onClose={closeModal} />}
            <div className="header">
                <div className="header-logo">
                    <a href="/main">ROBOBUDDY</a>
                </div>
                <div className="header-links">
                    <a href="/infoPage">Info</a>
                    <a href="/quizPage">Quiz</a>
                </div>
            </div>
            <img className="quiz-image" src={quizImage} alt="quizImage"></img>
            <div className="quiz-box">
                <p>{currentQuestion.question}</p>
            </div>
            <div className="quiz-buttons">
                <button className="button1" onClick={() => handleAnswer("O")} >
                    O
                </button>
                <button className="button2" onClick={() => handleAnswer("X")} >
                    X
                </button>
            </div>
        </div>
    );
}

export default App;