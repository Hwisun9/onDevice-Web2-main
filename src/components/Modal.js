import React from 'react';
import '../styles/Modal.css'; // 스타일을 위한 CSS 파일

function Modal({ message, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <button className="modal-button" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

export default Modal;
