// src/components/LoadingModal.jsx
import React from 'react';
import { Modal } from 'react-bootstrap';
import styled, { keyframes } from 'styled-components';

// 로딩 스피너 애니메이션 정의
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 2s linear infinite;
  margin: 0 auto 20px auto;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: #555;
  text-align: center;
`;

const LoadingModalContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
`;

const LoadingModal = ({ show }) => {
  return (
    <Modal show={show} centered backdrop="static" keyboard={false}>
      <LoadingModalContent>
        <LoadingSpinner />
        <LoadingText>장소를 추천 중입니다. 잠시만 기다려 주세요...</LoadingText>
      </LoadingModalContent>
    </Modal>
  );
};

export default LoadingModal;