import { useState } from 'react';

// 모달을 쉽게 관리할 수 있는 커스텀 훅
export function useModal() {
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    modalMessage,
    isModalOpen,
    openModal,
    closeModal,
  };
}
