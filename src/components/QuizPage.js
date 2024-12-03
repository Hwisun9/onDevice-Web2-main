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
        { question: "강아지는 사람의 얼굴 표정을 구분할 수 있다?", answer: "O", details: "강아지는 주인의 표정을 보고 감정을 이해할 수 있는 능력이 있습니다. " },
        { question: "강아지는 주인의 목소리를 알아듣지 못한다?", answer: "X", details: "강아지는 주인의 표정을 보고 감정을 이해할 수 있는 능력이 있습니다." },
        { question: "강아지는 땀샘이 발바닥에만 있다?", answer: "O", details: "강아지는 주로 발바닥에 있는 땀샘을 통해 땀을 배출합니다. 몸 온도는 헐떡이는 방식으로 조절하죠." },
        { question: "강아지는 색맹이다?", answer: "X", details: "강아지는 사람처럼 모든 색을 볼 수는 없지만, 완전히 색맹은 아닙니다. 파란색과 노란색은 구분할 수 있어요!" },
        { question: "강아지는 인간처럼 뇌의 좌뇌와 우뇌를 각각 독립적으로 사용할 수 있다?", answer: "X", details: "강아지는 인간처럼 뇌의 좌뇌와 우뇌를 독립적으로 사용할 수 없습니다. 연구에 따르면, 강아지의 뇌는 인간의 뇌와는 다르게 두 반구가 함께 협력하여 작업을 처리합니다." },
        { question: "강아지는 아프거나 스트레스를 받을 때 사람의 행동을 흉내낼 수 있다?", answer: "O", details: "강아지는 스트레스를 받거나 아플 때 사람의 행동을 흉내낼 수 있습니다. 예를 들어, 주인이 불안해하거나 스트레스를 받으면, 강아지도 비슷한 행동을 보일 수 있습니다." },
        { question: "강아지는 사람의 뇌파를 감지할 수 있다?", answer: "O", details: "일부 연구에 따르면, 강아지는 사람의 감정 상태와 뇌파를 감지할 수 있는 능력이 있습니다. 강아지는 사람의 뇌파를 통해 감정을 읽고 반응할 수 있다는 이론이 존재합니다." },
        { question: "강아지는 초음파를 들을 수 있다?", answer: "O", details: "강아지는 사람보다 훨씬 더 높은 주파수의 소리를 들을 수 있습니다. 이들은 40,000Hz에서 60,000Hz의 초음파를 감지할 수 있습니다." },
        { question: "강아지는 사람과 같은 방식으로 꿈을 꾼다?", answer: "O", details: "연구에 따르면, 강아지들은 사람처럼 REM(빠른 안구 운동) 수면 단계에서 꿈을 꾼다고 알려져 있습니다. 이때 강아지는 몸을 움직이거나 발을 떨 수 있습니다." },
        { question: "강아지의 청각은 고주파를 사람보다 잘 들을 수 있다?", answer: "O", details: "강아지의 청각은 고주파 소리를 매우 잘 들을 수 있습니다. 사람은 약 20Hz에서 20,000Hz 사이의 소리를 들을 수 있지만, 강아지는 40,000Hz에서 60,000Hz까지 들을 수 있습니다." },
        { question: "강아지는 왼발과 오른발을 구분할 수 없다?", answer: "X", details: "강아지들도 왼발과 오른발을 구분할 수 있습니다. 이들은 좌우 대칭으로 발을 움직이는 경향이 있지만, 일부 강아지는 특정 발을 선호할 수 있습니다. 이를 ‘왼손잡이’ 또는 ‘오른손잡이’ 강아지라고 할 수 있습니다!" },
        { question: "반려동물 호텔 중 7성급 호텔이 있다?", answer: "O", details: "두바이에 있습니다." },
        { question: "강아지의 무좀은 사람에게 옮는다?", answer: "X", details: "강아지의 무좀과 사람의 무좀은 별개이므로 옮지 않습니다." },
        { question: "모든 강아지는 수영을 잘 한다?", answer: "X", details: "모든 강아지가 수영을 잘하는 것은 아닙니다. 일부 강아지는 물을 두려워하기도 합니다." },
        { question: " 강아지는 자신을 거울로 인식하지 못한다?", answer: "O", details: "강아지는 거울 속 자신을 인식하지 못하는 경우가 많습니다. 대신 다른 강아지나 사람으로 인식할 수 있습니다." },
        { question: "푸들은 곱슬거리는 털이 특징이며 털이 거의 빠지지 않는다?", answer: "O", details: "푸들은 털이 잘 빠지지 않아 주기적인 브러싱이 중요합니다." },
        { question: "푸들은 하루 한 번, 15분 정도 산책하면 충분하다?", answer: "X", details: "푸들은 하루 최소 2회, 한 번에 30분 이상의 산책이 적당합니다." },
        { question: "말티즈는 슬개골 건강이 좋은 견종이다?", answer: "X", details: "말티즈는 슬개골이 약하므로 미끄럼 방지 매트 사용 및 높은 곳에서의 점프를 주의해야 합니다." },
        { question: "푸들은 다른 견종에 비해 심장병에 걸릴 확률이 높다?", answer: "X", details: "푸들은 비교적 건강한 견종으로 심장병보다는 관절 문제에 더 취약합니다." },
        { question: "말티즈는 자주 목욕하면 피부병에 걸릴 위험이 높다?", answer: "O", details: "잦은 목욕은 말티즈의 민감한 피부를 손상시킬 수 있어 적당한 빈도로 씻기는 것이 중요합니다." },
        { question: "말티즈는 간식 훈련보다 장난감을 활용한 훈련을 더 효과적으로 받아들인다?", answer: "X", details: "말티즈는 간식을 활용한 긍정적 강화 훈련에 더 잘 반응합니다." },
        { question: "말티즈는 나이가 들수록 성격이 차분해지고 고집이 줄어든다?", answer: "X", details: "말티즈는 나이가 들어도 고집이 세고 요구 행동이 지속될 수 있습니다." },
        { question: "말티즈는 주로 슬개골 탈구를 유발하는 운동보다는 유전적 요인으로 인해 슬개골 문제가 생긴다?", answer: "X", details: "높은 곳에서의 점프나 잘못된 자세로 인한 물리적 요인이 슬개골 문제를 악화시킵니다." },
        { question: "강아지는 하루 종일 자도 건강에 문제가 없다?", answer: "O", details: "강아지는 하루 평균 12~14시간 정도 자며, 특히 어린 강아지나 노령견은 더 많이 잡니다." },
        { question: "강아지가 꼬리를 흔드는 것은 항상 기분이 좋은 상태를 뜻한다?", answer: "X", details: "꼬리를 흔드는 것은 흥분을 나타내며, 긍정적일 수도 부정적일 수도 있습니다." },
        { question: "강아지는 사람보다 10배 이상 많은 냄새를 구별할 수 있다?", answer: "O", details: "강아지의 후각은 사람보다 약 10,000배 예민합니다." },
        { question: "강아지는 주인의 옷 냄새를 통해 안정감을 느낀다?", answer: "O", details: "강아지는 주인의 체취를 통해 편안함과 안정감을 느낍니다." },
        { question: "강아지는 인간이 최초로 길들인 동물이다?", answer: "O", details: "강아지는 인간이 최초로 길들인 동물로 약 15,000년 전에 시작되었습니다." },
        { question: "푸들은 원래 사냥견으로 길러졌다?", answer: "O", details: "푸들은 물속에서 새를 사냥하는 데 사용되던 사냥견이었습니다." },
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
        const detailsElement = (
            <span style={{ color: 'grey', fontWeight: 'bold' }}>
                {currentQuestion.details}
            </span>
        );
        if (answer === currentQuestion.answer) {
            openModal(
                <div>
                    <b>정답입니다!</b> <br /> {detailsElement}
                </div>);
        } else {
            openModal(
                <div>
                    <b>오답입니다!</b> <br /> {detailsElement}
                </div>
            );
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