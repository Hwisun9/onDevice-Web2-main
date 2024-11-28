import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; // firebase/auth에서 가져오기
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6VHBN8wQ4Vdht9MOffrXkGmdHf5Pt2H0",
  authDomain: "ondevice-llm.firebaseapp.com",
  projectId: "ondevice-llm",
  storageBucket: "ondevice-llm.firebasestorage.app",
  messagingSenderId: "785277407931",
  appId: "1:785277407931:web:59a121874ad7eb4ab20f9e",
  measurementId: "G-0BYF99LJXM"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 인증 객체
const auth = getAuth(app);

// Firestore
const db = getFirestore(app);

const storage = getStorage(app); // Firebase Storage 인스턴스

// export
export { app, auth, db, storage, createUserWithEmailAndPassword, signInWithEmailAndPassword };