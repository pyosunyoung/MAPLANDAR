// components/ScheduleListModal.jsx
import React, { useMemo } from 'react'; // useMemo 추가
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faSearch,
  faUserCircle,
  faUser,
  faClock,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
// import { Button } from 'react-bootstrap'; // React-Bootstrap 제거

// 이 부분은 캘린더에서 사용자 컬러를 결정하는 배열입니다.
// 실제 프로젝트의 `userColors` 배열을 여기에 맞게 정의하거나,
// 이 모달을 호출하는 상위 컴포넌트에서 `userColors` 배열 자체를 prop으로 넘겨받는 것이 더 좋습니다.
// 여기서는 임시로 예시 색상을 정의합니다.
const userColors = [
  '#FFE6CC', // 사용자2 예시 색상 (주황 계열)
  '#CCEEFF', // 사용자3 예시 색상 (파랑 계열)
  '#D7FFCC', // 다른 사용자 예시 색상
  '#FFCCFF',
  '#FFFFCC',
];

const ModalWrapper = styled.div`
  background: #f8f8f8; 
  padding: 30px; 
  border-radius: 12px;
  width: 100%;
  // max-height: 500px; /* 스크롤을 위한 최대 높이 */
  // overflow-y: auto; /* 내용이 많을 때 스크롤 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
`;

// X 버튼을 모달의 맨 오른쪽 상단에 배치
const CloseButtonContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  color: #333;
  padding: 0;
`;

// 날짜와 "일정 목록" 헤더
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end; /* 텍스트의 하단 정렬 */
  margin-bottom: 20px;
  padding-top: 10px; /* X 버튼과의 간격 확보 */

  h4 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
  }
`;

const ScheduleListContainer = styled.div`
  max-height: calc(500px - 180px); /* 모달 높이 - 헤더/버튼 높이 */
  overflow-y: auto;
  margin-bottom: 20px; /* 버튼과의 간격 */
`;

const ScheduleItem = styled.div`
  background-color: ${(props) => props.bgColor || '#f0f0f0'}; /* 배경색 적용 */
  padding: 15px; /* 내부 여백 조정 */
  border-radius: 8px;
  margin-bottom: 10px;
  position: relative; /* 수정/삭제 버튼 위치 지정을 위해 */
`;

const UserInfo = styled.p`
  font-size: 1.1rem; /* 사용자 이름 글씨 크기 */
  font-weight: bold;
  color: #333; /* 사용자 이름 색상 */
  margin-bottom: 5px;
`;

const TimeLocationInfo = styled.p`
  font-size: 0.85rem; /* 시간, 위치 정보 글씨 크기 */
  color: #666; /* 시간, 위치 정보 색상 */
  position: absolute; /* 사용자 이름과 같은 라인에 오른쪽으로 배치 */
  top: 15px;
  right: 15px;
  margin: 0; /* 기본 마진 제거 */
`;

const TitleText = styled.p`
  font-size: 1rem; /* 제목 글씨 크기 */
  color: #555; /* 제목 색상 */
  margin-bottom: 0; /* 마진 제거 */
`;

// 수정/삭제 버튼 컨테이너 (각 일정 아이템 내부)
const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end; /* 버튼들을 오른쪽으로 */
  gap: 8px; /* 버튼 간 간격 */
  margin-top: 10px; /* 위 내용과의 간격 */
`;

// "일정 추가" 버튼 스타일
const AddButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  background-color: #333;
  color: #fff;
  border: none;
  transition: background-color 0.2s ease;
  margin-bottom: 10px;

  &:hover {
    background-color: #555;
  }
`;

const ScheduleListModal = ({
  date,
  schedules,
  members,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onClose,
  // userColors prop을 받도록 추가
  availableUserColors = userColors, // 기본값 설정 (상위에서 prop으로 전달받지 않을 경우)
  profile
}) => {

  // useMemo를 사용하여 userColorMap을 한 번만 계산하도록 최적화
  const userColorMap = useMemo(() => {
    const map = new Map();
    members.forEach((member, index) => {
      // userId 대신, member의 고유한 식별자를 키로 사용합니다.
      // 여기서는 member.userId가 고유하다고 가정합니다.
      map.set(member.userId, availableUserColors[index % availableUserColors.length]);
    });
    return map;
  }, [members, availableUserColors]); // members나 availableUserColors가 변경될 때만 다시 계산

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return (
    <ModalWrapper>
      <CloseButtonContainer>
        <CloseButton onClick={onClose}>X</CloseButton>
      </CloseButtonContainer>

      <Header>
        <h4>{formatDate(date)}</h4>
        <h4>일정 목록</h4>
      </Header>

      <ScheduleListContainer>
        {schedules && schedules.length > 0 ? (
          schedules.map((schedule) => (
            <ScheduleItem
              key={schedule.scheduleId || schedule.id} // scheduleId가 있으면 사용, 없으면 id 사용
              bgColor={userColorMap.get(schedule.creatorId) || '#f0f0f0'} // creatorId로 색상 가져오기
            >
              <UserInfo>
                {members.find((m) => m.userId === schedule.creatorId)?.name || '알 수 없음'}
              </UserInfo>
              <TimeLocationInfo>
                <FontAwesomeIcon icon={faClock}/> {schedule.startDatetime?.substring(11, 16)} - {schedule.endDatetime?.substring(11, 16)} | <FontAwesomeIcon icon={faLocationDot}/> {schedule.address || '위치 정보 없음'}
              </TimeLocationInfo>
              <TitleText>{schedule.title}</TitleText>
              {/* 이미지에는 없지만, 수정/삭제 버튼 기능 유지를 위해 아래 ActionButtons에 배치 */}
              
              {profile.userId == schedule.creatorId && <ActionButtons>
                <button
                  style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => onEditClick(schedule)}
                >
                  수정
                </button>
                <button
                  style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => onDeleteClick(schedule.scheduleId)}
                >
                  삭제
                </button>
              </ActionButtons>}
            </ScheduleItem>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#777' }}>이 날짜에 일정이 없습니다.</p>
        )}
      </ScheduleListContainer>

      <AddButton onClick={onAddClick}>일정 추가</AddButton>
      {/* 닫기 버튼은 X 버튼으로 대체되었으므로 제거 */}
    </ModalWrapper>
  );
};

export default ScheduleListModal;