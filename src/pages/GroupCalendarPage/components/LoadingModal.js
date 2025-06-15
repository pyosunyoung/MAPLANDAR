// src/components/LoadingModal.jsx
import React from 'react';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';

const LoadingVideo = styled.video`
  width: 220px; /* 비디오 크기 조정 */
  height: 220px;
  margin: 0 auto 20px auto;
  display: block; /* 가끔 인라인 요소로 인식되어 여백 생기는 것 방지 */
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: #555;
  text-align: center;
  font-weight: 500; /* 텍스트 살짝 두껍게 */
`;

const LoadingModalContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); /* 좀 더 깊은 그림자 */
`;

const LoadingModal = ({ show }) => {
  return (
    <Modal show={show} centered backdrop="static" keyboard={false}>
      <LoadingModalContent>
        {/* MP4 비디오 삽입 */}
        <LoadingVideo autoPlay loop muted playsInline>
          <source src="https://cdn-icons-mp4.flaticon.com/512/17270/17270711.mp4" type="video/mp4" />
          Your browser does not support the video tag. {/* 비디오 지원 안될 시 대체 텍스트 */}
        </LoadingVideo>
        <LoadingText>장소를 추천 중입니다. 잠시만 기다려 주세요...</LoadingText>
      </LoadingModalContent>
    </Modal>
  );
};

export default LoadingModal;