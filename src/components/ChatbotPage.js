import React, { useState, useEffect } from 'react';
import '../styles/Basic.css';
import '../styles/ChatbotPage.css';

import mainLogo from '../assets/images/mainLogo.png';
import micButton from '../assets/images/mic.png';
import sendButton from '../assets/images/send.png';

function App() {
    const [searchHistory, setSearchHistory] = useState([]); // 검색 내역
    const [message, setMessage] = useState(''); // 입력 메시지
    const [response, setResponse] = useState(''); // 서버로부터 받은 응답
    const [audioUrl, setAudioUrl] = useState(''); // 서버로부터 받은 음성 URL
    const [audioInstance, setAudioInstance] = useState(null); // Remove if not used
    const SERVER_URL = 'http://<서버 IP>:<포트>'; // 서버 URL 입력

    const sendMessage = async () => {
        if (!message.trim()) return; // 빈 메시지는 처리하지 않음

        try {
            const res = await fetch(`${SERVER_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }), // JSON 데이터 전송
            });

            const data = await res.json(); // JSON 응답 처리
            setResponse(data.response); // 서버 응답 저장
            setAudioUrl(data.audio_url); // TTS 음성 파일 URL 저장

            // 검색 내역에 추가
            setSearchHistory([...searchHistory, { message, response: data.response }]);
            setMessage(''); // 입력 필드 초기화
        } catch (error) {
            console.error('서버와 통신 중 오류 발생:', error);
            alert('서버에 연결할 수 없습니다.');
        }
    };

    useEffect(() => {
        if (audioUrl) {
            console.log('Audio URL:', audioUrl); // URL 확인
            const audio = new Audio(audioUrl);
            audio.play().catch((error) => console.error('오디오 재생 오류:', error));
        }
    }, [audioUrl]);
    return (
        <div className="chatbot">
            {/* 헤더 */}
            <div className="header">
                <div className="header-logo">
                    <a href="/main">ROBOBUDDY</a>
                </div>
                <div className="header-links">
                    <a href="/infoPage">Info</a>
                    <a href="/quiz">Quiz</a>
                </div>
            </div>

            {/* 좌측 사이드바 */}
            <div className="sidebar">
                <div className="search-history-container">
                    <h3>검색 내역</h3>
                    <ul>
                        {searchHistory.map((chat, index) => (
                            <li key={index}>
                                {chat.message}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="vertical-line"></div>
            </div>

            {/* 채팅 부분 */}
            <div className="center-container">
                <div className="dog-icon">
                    <img src={mainLogo} alt="Main Logo" className="logo-image" />
                </div>
                <p className="description">강아지에 대해 무엇이든 물어보세요!</p>
                {response && (
                    <div className="chat-response">
                        <p>{response}</p>
                    </div>
                )}
            </div>

            {/* 입력 부분 */}
            <div className="input-container">
                <button className="mic-button">
                    <img src={micButton} alt="micButton" className="icon-image" />
                </button>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="메시지를 입력하세요."
                    className="text-input"
                />
                <button className="send-button" onClick={sendMessage}>
                    <img src={sendButton} alt="sendButton" className="icon-image" />
                </button>
            </div>
        </div>
    );
}

export default App;