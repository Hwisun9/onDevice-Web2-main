import React from 'react';
import '../styles/Basic.css'
import '../styles/InfoPage.css'

import { Link } from 'react-router-dom';  // 'Link' import 추가

import image1 from '../assets/images/info_image1.jpg';
import image2 from '../assets/images/info_image2.jpg';

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
                <img src={image1} alt="image1" className="info-image1" ></img>
                <img src={image2} alt="image2" className="info-image2" ></img> 
            </div>

        </div>
    );
}

export default App;