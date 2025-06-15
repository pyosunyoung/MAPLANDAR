import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { showToastMessage } from '../../../features/common/uiSlice';
import { useDispatch } from 'react-redux';

// Kakao Map 전역 객체 선언 (lint 에러 방지)
const { kakao } = window;

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

const RecommendationOptions = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 600px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #555;
  cursor: pointer;

  input[type="radio"] {
    margin-right: 8px;
    transform: scale(1.2);
  }
`;

const UserPlacesContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 30px;
`;

const UserPlaceItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f8ff;
  border-radius: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  span {
    font-size: 0.95rem;
    color: #333;
    font-weight: bold;
    margin-right: 10px;
    width: 80px; /* 사용자 이름 고정 너비 */
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    color: #555;
    flex-grow: 1;
  }
`;

const MapAndListContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 900px; /* 지도를 위해 최대 너비 확장 */
  height: 500px; /* 고정 높이 */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  background-color: #fff;
`;

const PlaceListContainer = styled.div`
  width: 35%; /* 목록이 차지할 너비 */
  padding: 15px;
  border-right: 1px solid #eee;
  overflow-y: auto; /* 목록이 길어지면 스크롤 */
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
`;

const SearchInputGroup = styled(InputGroup)`
  margin-bottom: 15px;
`;

const SearchButton = styled(Button)`
  background-color: #28a745;
  border-color: #28a745;
  &:hover {
    background-color: #218838;
    border-color: #1e7e34;
  }
`;

const InitialRecommendationButton = styled(Button)`
  width: 100%;
  margin-bottom: 15px;
  background-color: #6c757d;
  border-color: #6c757d;
  &:hover {
    background-color: #5a6268;
    border-color: #545b62;
  }
`;

const PlaceListItemsWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
`;

const PlaceListItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #e9ecef;
  }
  p {
    margin: 0;
    font-size: 0.95rem;
    font-weight: bold;
    color: #333;
  }
  span {
    font-size: 0.85rem;
    color: #777;
  }
`;

const KakaoMapWrapper = styled.div`
  width: 65%;
  height: 100%;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: #888;
`;

const RecommendationTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
  max-width: 600px;
`;

const RecommendationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 900px;
  margin-bottom: 30px;
`;

const RecommendationCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 180px;
`;

const CardImage = styled.div`
  width: 100%;
  height: 120px;
  background-color: #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #6c757d;
  font-size: 0.9rem;
  border-bottom: 1px solid #dee2e6;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  padding: 15px;
  flex-grow: 1;

  p {
    margin: 0 0 5px 0;
    font-size: 1rem;
    color: #333;
    font-weight: bold;
    word-break: keep-all;
  }

  span {
    font-size: 0.85rem;
    color: #777;
    display: block;
  }
`;

const NoResultText = styled.p`
  text-align: center;
  color: #777;
  font-size: 1.1rem;
  padding: 20px;
  width: 100%;
  max-width: 600px;
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
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // kakao map 인스턴스를 저장
  const markers = useRef({}); // 마커들을 객체로 저장하여 ID로 접근 (key: place.id or uniqueId)
  const overlays = useRef([]); // 커스텀 오버레이들을 저장할 배열 (사용자 이름 표시용)
  const infoWindowRef = useRef(null); // InfoWindow 인스턴스를 저장

  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [userPlaces, setUserPlaces] = useState([]); // 선택된 사용자 장소 정보
  const [recommendationType, setRecommendationType] = useState('middle');
  const [placeTitle, setPlaceTitle] = useState('');
  const [keyword, setKeyword] = useState('');
  const [displayedPlaces, setDisplayedPlaces] = useState([]); // 지도에 표시되고 목록에 나타날 장소들 (추천 or 검색 결과)
  const [locationPlaces, setLocationPlaces] = useState('');
  // 마커 제거 함수
  const removeMarkers = useCallback(() => {
    Object.values(markers.current).forEach(marker => marker.setMap(null));
    markers.current = {}; // 객체 초기화
  }, []);

  // 오버레이 제거 함수
  const removeOverlays = useCallback(() => {
    for (let i = 0; i < overlays.current.length; i++) {
      overlays.current[i].setMap(null);
    }
    overlays.current = [];
  }, []);

  // 마커를 지도에 표시하고 배열에 추가하는 함수
  // place 객체에 고유한 `id` 속성이 있다고 가정합니다.
  // 만약 place 객체에 `id`가 없다면, `index`나 다른 고유한 값으로 대체해야 합니다.
  const displayMarker = useCallback((place, isUserPlace = false) => {
    // 위도, 경도 유효성 검사
    if (isNaN(place.latitude) || isNaN(place.longitude)) {
        console.warn(`유효하지 않은 위도/경도: ${place.placeName || place.userName}`);
        return null; // 유효하지 않으면 마커 생성 안 함
    }

    const markerPosition = new kakao.maps.LatLng(place.latitude, place.longitude);
    const marker = new kakao.maps.Marker({
      map: mapInstance.current,
      position: markerPosition,
      title: place.placeName || `${place.userName}의 장소`,
      image: isUserPlace ?
        new kakao.maps.MarkerImage('https://cdn-icons-png.flaticon.com/512/5216/5216405.png', new kakao.maps.Size(40, 40)) :
        null // 추천/검색 장소는 기본 마커
    });

    // 마커에 고유한 ID를 저장하여 나중에 쉽게 찾을 수 있도록 함
    // place.id가 없다면 placeName, addressName 등을 조합하여 고유 ID를 생성합니다.
    const placeId = place.id || `${place.placeName || place.userName}_${place.latitude}_${place.longitude}`;
    markers.current[placeId] = marker;


    // 커스텀 오버레이 (사용자 장소에만 해당)
    if (isUserPlace) {
      const content = `
        <div style="
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 5px 8px;
          font-size: 13px;
          font-weight: bold;
          color: #333;
          box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
          white-space: nowrap;
          position: relative;
          top: -7px;
          left: 47px;
        ">
          ${place.userName}
        </div>
      `;

      const customOverlay = new kakao.maps.CustomOverlay({
        map: mapInstance.current,
        position: markerPosition,
        content: content,
        yAnchor: 1
      });
      overlays.current.push(customOverlay); // 오버레이도 배열에 추가
    }

    // 마커 클릭 이벤트 리스너 추가 (토스트 메시지)
    kakao.maps.event.addListener(marker, 'click', function() {
      dispatch(
        showToastMessage({
          message: `${place.placeName || place.userName}: ${place.roadAddressName || place.address}`,
          status: 'info',
        })
      );
    });
    
    return markerPosition;
  }, [dispatch]);

  // 지도에 장소들을 표시하는 함수 (추천 장소 또는 검색 결과)
  const displayAllPlacesOnMap = useCallback(() => {
    if (!mapInstance.current) return;

    removeMarkers(); // 기존 마커 모두 제거
    removeOverlays(); // 기존 오버레이 모두 제거
    const bounds = new kakao.maps.LatLngBounds();

    // 현재 표시될 장소들 (추천 장소 또는 검색 결과) 마커 표시
    displayedPlaces.forEach(place => {
      const position = displayMarker(place, false);
      if (position) bounds.extend(position);
    });

    // 사용자 장소 마커 표시
    userPlaces.forEach(userPlace => {
      const position = displayMarker(userPlace, true);
      if (position) bounds.extend(position);
    });

    // 모든 마커가 보이도록 지도 범위 재설정
    if (displayedPlaces.length > 0 || userPlaces.length > 0) {
      mapInstance.current.setBounds(bounds);
    } else {
        // 표시할 장소가 하나도 없으면 초기 중심점으로 이동 (선택 사항)
        mapInstance.current.setCenter(new kakao.maps.LatLng(37.5665, 126.9780)); // 서울 시청
        mapInstance.current.setLevel(6);
    }
  }, [displayedPlaces, userPlaces, displayMarker, removeMarkers, removeOverlays]);

  // 컴포넌트 마운트 시 초기 데이터 설정 및 지도 로딩
  useEffect(() => {
    if (location.state && location.state.recommendedPlaces) {
      setRecommendedPlaces(location.state.recommendedPlaces);
      setDisplayedPlaces(location.state.recommendedPlaces); // 초기에는 추천 장소를 displayedPlaces로 설정
      
      if (location.state.selectedUserPlaces && location.state.selectedUserPlaces.userAddresses) {
        const processedUserPlaces = Object.entries(location.state.selectedUserPlaces.userAddresses).map(([userName, address]) => ({
          userName: userName,
          address: address,
          latitude: location.state.selectedUserPlaces.userCoordinates?.[userName]?.latitude,
          longitude: location.state.selectedUserPlaces.userCoordinates?.[userName]?.longitude
        }));
        setUserPlaces(processedUserPlaces);

        const userNames = Object.keys(location.state.selectedUserPlaces.userAddresses);
        setPlaceTitle(`${userNames.join(', ')}님의 추천 장소`);
      } else if (Array.isArray(location.state.selectedUserPlaces)) {
        setUserPlaces(location.state.selectedUserPlaces);
        const userNames = location.state.selectedUserPlaces?.map(p => p.userName) || [];
        setPlaceTitle(`${userNames.join(', ')}님의 추천 장소`);
      } else {
        setUserPlaces([]);
        setPlaceTitle('장소 추천 결과');
      }

      dispatch(
        showToastMessage({
          message: '장소 추천을 성공했습니다!',
          status: 'success',
        })
      );
      setLocationPlaces(location.state.location)
    } else {
      dispatch(
        showToastMessage({
          message: '추천된 장소 정보가 없습니다.',
          status: 'warning',
        })
      );
    }
  }, [location.state, dispatch]);

  // 지도 초기화 및 마커 표시 (recommendedPlaces, userPlaces, displayedPlaces 변경 시 재실행)
  useEffect(() => {
    if (!mapRef.current) return;

    const allLatitudes = displayedPlaces.map(p => p.latitude).filter(lat => !isNaN(lat))
                           .concat(userPlaces.map(p => p.latitude).filter(lat => !isNaN(lat)));
    const allLongitudes = displayedPlaces.map(p => p.longitude).filter(lng => !isNaN(lng))
                            .concat(userPlaces.map(p => p.longitude).filter(lng => !isNaN(lng)));

    let centerLat = 37.5665; // 기본값: 서울 시청
    let centerLng = 126.9780;
    let initialMapLevel = 6;

    if (allLatitudes.length > 0 && allLongitudes.length > 0) {
        centerLat = allLatitudes.reduce((sum, lat) => sum + lat, 0) / allLatitudes.length;
        centerLng = allLongitudes.reduce((sum, lng) => sum + lng, 0) / allLongitudes.length;
        initialMapLevel = 6;
    } else if (recommendedPlaces.length > 0) {
        centerLat = recommendedPlaces[0].latitude;
        centerLng = recommendedPlaces[0].longitude;
        initialMapLevel = 6;
    }


    kakao.maps.load(() => {
      const mapOption = {
        center: new kakao.maps.LatLng(centerLat, centerLng),
        level: initialMapLevel,
      };

      if (!mapInstance.current) {
        mapInstance.current = new kakao.maps.Map(mapRef.current, mapOption);
        infoWindowRef.current = new kakao.maps.InfoWindow({ zIndex: 1 });
      } else {
        mapInstance.current.setCenter(mapOption.center);
        mapInstance.current.setLevel(mapOption.level);
      }
      
      displayAllPlacesOnMap(); // 모든 장소 (추천 + 사용자 + 검색)를 지도에 표시
    });

    return () => {
        removeMarkers();
        removeOverlays();
        if (infoWindowRef.current) {
            infoWindowRef.current.close();
            infoWindowRef.current = null;
        }
        mapInstance.current = null;
    };
  }, [recommendedPlaces, userPlaces, displayedPlaces, displayAllPlacesOnMap, removeMarkers, removeOverlays]);

  // 키워드 검색 함수
  const searchPlacesByKeyword = (keywordToSearch) => {
    if (!mapInstance.current || !kakao.maps.services.Places) {
      dispatch(showToastMessage({ message: '지도 서비스 로딩 중입니다. 잠시 후 다시 시도해주세요.', status: 'warning' }));
      return;
    }

    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(keywordToSearch, (data, status, pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        const newSearchedPlaces = data.map(place => ({
          // 고유 ID 추가: 카카오 API place.id가 있으면 사용, 없으면 조합하여 생성
          id: place.id || `${place.place_name}_${place.y}_${place.x}`,
          placeName: place.place_name,
          addressName: place.address_name,
          roadAddressName: place.road_address_name,
          latitude: parseFloat(place.y),
          longitude: parseFloat(place.x),
        }));
        setDisplayedPlaces(newSearchedPlaces);

        dispatch(showToastMessage({ message: `${newSearchedPlaces.length}개의 장소를 찾았습니다.`, status: 'success' }));
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        setDisplayedPlaces([]);
        dispatch(showToastMessage({ message: '검색 결과가 없습니다.', status: 'info' }));
      } else {
        dispatch(showToastMessage({ message: '장소 검색 중 오류가 발생했습니다.', status: 'error' }));
      }
    }, {
      // category_group_code: 'AT4',
      // bounds: mapInstance.current.getBounds()
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) {
      dispatch(showToastMessage({ message: '검색어를 입력해주세요.', status: 'warning' }));
      return;
    }
    searchPlacesByKeyword(keyword.trim());
  };

  const handleShowInitialRecommendations = () => {
    setDisplayedPlaces(recommendedPlaces);
    setKeyword('');
    dispatch(showToastMessage({ message: '초기 추천 장소 목록을 다시 표시합니다.', status: 'info' }));
  };

  const handleBackToCalendar = () => {
    navigate(-1);
  };

  const handlePlaceListItemClick = (place) => {
    if (mapInstance.current && place.latitude && place.longitude) {
      const moveLatLon = new kakao.maps.LatLng(place.latitude, place.longitude);
      mapInstance.current.panTo(moveLatLon);
      mapInstance.current.setLevel(3);
      dispatch(showToastMessage({ message: `${place.placeName || place.userName}으로 이동합니다.`, status: 'info' }));
    }
  };

  // 마우스 호버 시 정보 윈도우 표시
  const handleMouseEnterListItem = useCallback((place) => {
    if (!infoWindowRef.current || !mapInstance.current) return;

    // 장소의 고유 ID를 사용하여 해당 마커를 찾습니다.
    const placeId = place.id || `${place.placeName || place.userName}_${place.latitude}_${place.longitude}`;
    const targetMarker = markers.current[placeId];
    
    if (targetMarker) {
      infoWindowRef.current.setContent(`<div style="padding:5px;font-size:12px;text-align:center;">${place.placeName}</div>`);
      infoWindowRef.current.open(mapInstance.current, targetMarker);
    }
  }, [mapInstance.current, infoWindowRef.current, markers.current]); // 의존성 배열에 ref.current 값들을 추가

  // 마우스 리브 시 정보 윈도우 닫기
  const handleMouseLeaveListItem = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, [infoWindowRef.current]); // 의존성 배열에 ref.current 값들을 추가


  return (
    <PageContainer>
      <Header>
        <h2>장소 추천 결과</h2>
        <p>선택하신 사용자들의 장소를 기반으로 추천된 장소 목록입니다.</p>
      </Header>

      <RecommendationOptions>
        <RadioOption>
          <input
            type="radio"
            name="recommendationType"
            value="middle"
            checked={recommendationType === 'middle'}
            onChange={(e) => setRecommendationType(e.target.value)}
          />
          중간 지점 추천
        </RadioOption>
        <RadioOption>
          <input
            type="radio"
            name="recommendationType"
            value="route"
            checked={recommendationType === 'route'}
            onChange={(e) => setRecommendationType(e.target.value)}
          />
          경로 바탕 추천
        </RadioOption>
      </RecommendationOptions>

      <UserPlacesContainer>
        {userPlaces.length > 0 ? (
          userPlaces.map((userPlace, index) => (
            <UserPlaceItem key={index}>
              <span>{userPlace.userName}:</span>
              <p>{userPlace.address}</p>
            </UserPlaceItem>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#777' }}>선택된 사용자들의 장소 정보가 없습니다.</p>
        )}
      </UserPlacesContainer>

      <MapAndListContainer>
        <PlaceListContainer>
          <h4>장소 목록</h4>
          <Form onSubmit={handleSearchSubmit}>
            <SearchInputGroup className="mb-3">
              <Form.Control
                placeholder="장소 검색..."
                aria-label="장소 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <SearchButton variant="success" type="submit">검색</SearchButton>
            </SearchInputGroup>
          </Form>
          <InitialRecommendationButton
            variant="secondary"
            onClick={handleShowInitialRecommendations}
            disabled={recommendedPlaces.length === 0}
          >
            초기 추천 장소 보기
          </InitialRecommendationButton>
          <PlaceListItemsWrapper>
            {displayedPlaces.length > 0 ? (
              displayedPlaces.map((place, index) => (
                <PlaceListItem
                  key={place.id || index} // key prop을 place.id로 변경하거나 index를 사용 (index는 유니크하지 않을 수 있음)
                  onClick={() => handlePlaceListItemClick(place)}
                  onMouseEnter={() => handleMouseEnterListItem(place)}
                  onMouseLeave={handleMouseLeaveListItem}
                >
                  <p>{place.placeName}</p>
                  <span>{place.roadAddressName || place.addressName}</span>
                </PlaceListItem>
              ))
            ) : (
              <p style={{ fontSize: '0.9rem', color: '#777' }}>목록이 없습니다.</p>
            )}
          </PlaceListItemsWrapper>
        </PlaceListContainer>
        <KakaoMapWrapper ref={mapRef}>
          {(recommendedPlaces.length === 0 && displayedPlaces.length === 0 && userPlaces.length === 0) ? "지도 정보를 불러오는 중..." : null}
        </KakaoMapWrapper>
      </MapAndListContainer>

      <RecommendationTitle>{placeTitle}</RecommendationTitle>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: '30px' }}>
        선택하신 {locationPlaces}에 맞는 장소를 추천해요!
      </p>

      <RecommendationGrid>
        {recommendedPlaces && recommendedPlaces.length > 0 ? (
          recommendedPlaces.map((place, index) => (
            <RecommendationCard key={index}>
              <CardImage>
                <span>이미지 준비중</span>
              </CardImage>
              <CardContent>
                <p>{place.placeName}</p>
                <span>{place.roadAddressName || place.addressName}</span>
              </CardContent>
            </RecommendationCard>
          ))
        ) : (
          <NoResultText>추천된 장소가 없습니다.</NoResultText>
        )}
      </RecommendationGrid>

      <BackButton onClick={handleBackToCalendar}>캘린더로 돌아가기</BackButton>
    </PageContainer>
  );
};

export default RecommendationResultPage;