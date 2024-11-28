import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase'; // firebase.js에서 db 가져오기
import { doc, getDoc } from 'firebase/firestore';

import { Link } from 'react-router-dom';  // 'Link' import 추가
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

import Modal from './Modal';
import { useModal } from '../hooks/useModal';

import '../styles/Basic.css'
import '../styles/MyPage.css'

import default_image from '../assets/images/myPage_dog.png'


function MyPage() {
    const { currentUser, isAuthReady, logout } = useAuth();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const auth = getAuth(); // Firebase auth 객체 가져오기
    const { modalMessage, isModalOpen, openModal, closeModal } = useModal();
    const defaultImage = default_image; // 기본 이미지 URL
    const [image, setImage] = useState(defaultImage);


    // 페이지 로드 시 로컬 스토리지에서 이미지 가져오기
    useEffect(() => {
        const savedImage = localStorage.getItem('${userData.email}_uploadedImage');
        if (savedImage) {
            setImage(savedImage);
        }

        const fetchUserData = async () => {
            const user = auth.currentUser; // 현재 로그인된 사용자
            if (user) {
                try {
                    // Firestore에서 유저 데이터를 가져오기
                    const docRef = doc(db, 'users', user.uid); // 'users' 컬렉션에서 현재 사용자 문서 가져오기
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUserData(docSnap.data()); // 가져온 데이터를 상태에 저장
                    } else {
                        openModal('사용자 데이터가 존재하지 않습니다.');
                    }
                } catch (error) {
                    openModal('데이터를 가져오는 데 오류가 발생했습니다: ' + error.message);
                }
            } else {
                openModal('로그인된 사용자가 없습니다.');
                navigate('/loginPage'); // 로그인 페이지로 리디렉션
            }
        };

        fetchUserData();
    }, [auth, navigate]);


    // 파일 선택 시 이미지 변경
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64Image = reader.result;
                setImage(base64Image);
                localStorage.setItem('${userData.email}_uploadedImage', base64Image); // 로컬 스토리지에 저장
            };
            reader.readAsDataURL(file);
        }
    };


    const handleLogout = async () => {
        try {
            logout();
            navigate("/main");
            openModal('로그아웃 성공! 홈화면으로 돌아갑니다.');
            setTimeout(() => {
                navigate('/Main');
            }, 2000); // 모달이 열린 후 2초 후 로그인 페이지로 이동
        } catch (error) {
            openModal('로그아웃 실패:', error.message);
        }
    };


    return (
        <div className="mypage">
            {isModalOpen && <Modal message={modalMessage} onClose={closeModal} />}

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
            {/* 마이페이지 */}
            {userData ? (
                <div className="mypage-content">
                    <img
                        className="image-icon"
                        src={image}
                        alt="Uploaded"
                    />
                    <div className="file-upload">
                    <button className="custom-file-upload" onClick={() => document.getElementById('file-upload').click()}>
                        파일 선택
                    </button>
                    <input 
                    className="file" 
                    id="file-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} />
                    </div>
                    <div className="container">
                        <p className="name">{userData.petInfo.petName} /</p>
                        <p className="gender">{userData.petInfo.petGender}</p>
                    </div>

                    <p className="age">{userData.petInfo.petAge} 살</p>
                    <p className="special-note">특이사항: {userData.petInfo.specialNotes}</p>

                    <button className="logout-button" onClick={handleLogout}>Log-out</button>
                </div>
            ) : (
                <div className="loading">로딩 중...</div>
            )}
        </div>
    );
}

export default MyPage;