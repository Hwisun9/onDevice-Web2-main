import React from 'react';
import '../styles/Basic.css'
import '../styles/InfoPage.css'

import { Link } from 'react-router-dom';  // 'Link' import 추가

import infoImage from '../assets/images/info.png';

function App() {
    return (
        <div class="info">
            <div className="header">
                <div className="header-logo">
                    <a href="/main">ROBOBUDDY</a>
                </div>
                <div className="header-links">
                    <a href="/infoPage">Info</a>
                    <a href="/quizPage">Quiz</a>
                </div>
            </div>

            <div className="info-content">
                <img src={infoImage} alt="image" className="info-image" ></img> 
            </div>

        </div>
    );
}

export default App;