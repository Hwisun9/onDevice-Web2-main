import React, { useState, useEffect } from 'react';
import fetchChatGPTResponse from '../api';
import { startSpeechRecognition, speakText } from '../utils/speech';

import mainLogo from '../assets/images/mainLogo.png';
import micButton from '../assets/images/mic.png';
import sendButton from '../assets/images/send.png';

import '../styles/Basic.css';
import '../styles/ChatbotPage.css';

function Main() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [recording, setRecording] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [firstQuestion, setFirstQuestion] = useState('');

    const MAX_CHAT_HISTORY = 8; // 최대 대화 기록 개수

    // 로컬 스토리지에서 이전 대화 기록 불러오기
    useEffect(() => {
        const storedHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
        setChatHistory(storedHistory);
    }, []);

    // chatHistory가 변경될 때마다 로컬 스토리지 업데이트
    useEffect(() => {
        if (chatHistory.length > 0) {
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        }
    }, [chatHistory]);

    const addNewChatToHistory = (title) => {
        const newChat = {
            id: Date.now(),
            title,
            time: new Date().toISOString(), // 대화 시작 시간 저장
            chats: [],
        };
        setChatHistory((prevHistory) => {
            // 새로운 대화 기록 추가 후 초과된 경우 오래된 항목 제거
            const updatedHistory = [...prevHistory, newChat];
            if (updatedHistory.length > MAX_CHAT_HISTORY) {
                updatedHistory.shift(); // 가장 오래된 항목 제거
            }
            return updatedHistory;
        });
    };

    const updateLastChatInHistory = (newMessages) => {
        setChatHistory((prevHistory) => {
            const updatedHistory = [...prevHistory];
            if (updatedHistory.length > 0) {
                updatedHistory[updatedHistory.length - 1].chats = newMessages;
            }
            return updatedHistory;
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendText(); // 엔터키로 메시지 전송
        }
    };

    const handleSendText = async () => {
        if (!input) return;

        const userMessage = { sender: 'user', text: input };
        const botResponse = await fetchChatGPTResponse(input);
        const newMessages = [...messages, userMessage, { sender: 'bot', text: botResponse }];

        if (!firstQuestion) {
            setFirstQuestion(input);
            addNewChatToHistory(input);
        }

        setMessages(newMessages);
        updateLastChatInHistory(newMessages);
        speakText(botResponse);
        setInput('');
    };

    // const handleStartRecording = () => {
    //     setRecording(true);
    //     startSpeechRecognition(
    //         async (transcript) => {
    //             setRecording(false);

    //             const userMessage = { sender: 'user', text: transcript };
    //             const botResponse = await fetchChatGPTResponse(transcript);
    //             const newMessages = [...messages, userMessage, { sender: 'bot', text: botResponse }];

    //             if (!firstQuestion) {
    //                 setFirstQuestion(transcript);
    //                 addNewChatToHistory(transcript);
    //             }

    //             setMessages(newMessages);
    //             updateLastChatInHistory(newMessages);
    //             speakText(botResponse);
    //         },
    //         (error) => {
    //             setRecording(false);
    //             console.error('Speech recognition error:', error);
    //         }
    //     );
    // };
    const handleStartRecording = async () => {
        setRecording(true);
    
        try {
            // Flask 서버에 음성 녹음을 요청
            const response = await fetch('http://127.0.0.1:5000/record', { method: 'GET' });
            const data = await response.json();
            
            if (data.text) {
                setRecording(false);
                const userMessage = { sender: 'user', text: data.text };
                const botResponse = await fetchChatGPTResponse(data.text);
                const newMessages = [...messages, userMessage, { sender: 'bot', text: botResponse }];
                
                if (!firstQuestion) {
                    setFirstQuestion(data.text);
                    addNewChatToHistory(data.text);
                }
    
                setMessages(newMessages);
                updateLastChatInHistory(newMessages);
                speakText(botResponse);
            } else {
                console.error("응답 오류:", data.error);
            }
    
        } catch (error) {
         
            console.error('음성 녹음 중 오류 발생:', error);
        } finally {
            setRecording(false);
        }
    };

    const handleChatHistoryClick = (session) => {
        setMessages(session.chats);
        setFirstQuestion(session.title);
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        // Invalid Date가 발생하는 경우 처리
        if (isNaN(date)) {
            return "Invalid Date";
        }
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="chatbot">
            {/* 헤더 */}
            <div className="header">
                <div className="header-logo">
                    <a href="/main">ROBOBUDDY</a>
                </div>
                <div className="header-links">
                    <a href="/infoPage">Info</a>
                    <a href="/quizPage">Quiz</a>
                </div>
            </div>

            {/* 좌측 사이드바 */}
            <div className="sidebar">
                
                <div className="chat-history">
                    {chatHistory.map((session) => (
                        <div
                            key={session.id}
                            className="history-item"
                            onClick={() => handleChatHistoryClick(session)}
                        >
                            <p className="chat-time">{formatTime(session.time)}</p> {/* 시간 표시 */}
                            <p className="chat-title">{session.title}</p>
                        </div>
                    ))}
                </div>
                <div className="vertical-line"></div>
            </div>

            {/* 채팅 부분 */}
            <div className="center-container">
                <div className="chat-container">
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.sender === 'user' ? 'user-msg' : 'bot-msg'}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <div className="intro-section">
                    <div className="dog-icon">
                        <img src={mainLogo} alt="Main Logo" className="logo-image" />
                    </div>
                    <p className="description">강아지에 대해 무엇이든 물어보세요!</p>
                </div>
            </div>

            {/* 입력 부분 */}
            <div className="input-container">
                <button className="mic-button" onClick={handleStartRecording} disabled={recording}>
                    {recording ? 'Recording...' : <img src={micButton} alt="micButton" className="icon-image" />}
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress} // 엔터키 이벤트 추가 
                    placeholder="메시지를 입력하세요."
                    className="text-input"
                />
                <button className="send-button" onClick={handleSendText}>
                    <img src={sendButton} alt="sendButton" className="icon-image" />
                </button>
            </div>
        </div>
    );
}

export default Main;
