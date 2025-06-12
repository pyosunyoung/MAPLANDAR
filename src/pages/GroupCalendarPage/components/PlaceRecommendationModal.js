// src/pages/RecommendationResultPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // useLocation, useNavigate 훅 import
import styled from 'styled-components';
import { Button } from 'react-bootstrap'; // 버튼 사용을 위해 import
import { showToastMessage } from '../../../features/common/uiSlice';
import { useDispatch } from 'react-redux';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  box-sizing: border-box;
`;

const Header = styled.div`
  width: 100%;
  max-width: 600px;
  text-align: center;
  margin-bottom: 30px;

  h2 {
    font-size: 2.2rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }

  p {
    font-size: 1.1rem;
    color: #555;
  }
`;

const RecommendationList = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 30px;
`;

const RecommendationItem = styled.div`
  background: #f8f8f8;
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  &:last-child {
    margin-bottom: 0;
  }

  p {
    margin: 5px 0;
    font-size: 1.1rem;
    color: #333;
    font-weight: bold;
  }

  span {
    font-size: 0.95rem;
    color: #777;
  }
`;

const NoResultText = styled.p`
  text-align: center;
  color: #777;
  font-size: 1.1rem;
  padding: 20px;
`;

const BackButton = styled(Button)`
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  background-color: #007bff;
  border-color: #007bff;
  border-radius: 8px;

  &:hover {
    background-color: #0056b3;
    border-color: #0056b3;
  }
`;

const RecommendationResultPage = () => {
  const location = useLocation(); // 라우터로부터 state를 가져오기 위해 useLocation 사용
  const navigate = useNavigate(); // 페이지 이동을 위해 useNavigate 사용
  const dispatch = useDispatch();
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [title, setTitle] = useState('');
  const [userMember, setUserMember]= useState([]);
  useEffect(() => {
    dispatch(
        showToastMessage({
          message: '장소 추천을 성공했습니다!',
          status: 'success',
        })
      );
    // location.state에서 recommendedPlaces를 가져옵니다.
    // 만약 state가 없거나 recommendedPlaces가 없으면 빈 배열로 초기화
    if (location.state && location.state.recommendedPlaces) {
      setRecommendedPlaces(location.state.recommendedPlaces);
      setTitle(location.state.title)
      setUserMember(location.state.userNames);
    }
  }, [location.state]);

  const handleBackToCalendar = () => {
    // 이전 캘린더 페이지로 돌아갑니다. (그룹 ID를 유지하며)
    // 실제 그룹 캘린더 페이지 URL에 맞게 수정하세요.
    navigate(-1); // 이전 페이지로 이동
    // navigate(`/group/${location.state?.groupId}`); // 특정 그룹 캘린더 페이지로 이동하고 싶다면
  };
//title 삽입 내용 최준서, 표선영의 추천 장소
//userNames(2) ['최준서', '표선영'] map으로 보여줘야할듯
  return (
    <PageContainer>
      <Header>
        <h2>장소 추천 결과</h2>
        <p>선택하신 사용자들을 기반으로 추천된 장소 목록입니다.</p>
      </Header>
      <p>{title}</p>
      <RecommendationList>
        {recommendedPlaces && recommendedPlaces.length > 0 ? (
          recommendedPlaces.map((place, index) => (
            <RecommendationItem key={index}>
              <p>{place.placeName}</p>
              <span>{place.addressName}</span>
              <span>{place.roadAddressName}</span>
              {/* 필요하다면 위도/경도 정보도 표시 */}
              <span>위도: {place.latitude?.toFixed(6)}, 경도: {place.longitude?.toFixed(6)}</span>
            </RecommendationItem>
          ))
        ) : (
          <NoResultText>추천된 장소가 없습니다.</NoResultText>
        )}
      </RecommendationList>
      <BackButton onClick={handleBackToCalendar}>캘린더로 돌아가기</BackButton>
    </PageContainer>
  );
};

export default RecommendationResultPage;