import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import { Button, Form } from 'react-bootstrap'; // React-Bootstrap 제거
import { fetchCoordinates } from '../../../utils/geocode'; // 추가
import { useSelector } from 'react-redux';

// ModalWrapper는 이미지의 배경 색상과 전체적인 크기, 그림자를 고려하여 조정합니다.
const ModalWrapper = styled.div`
  background: #f8f8f8; /* 배경색을 이미지와 유사하게 조정 */
  padding: 30px; /* 내부 여백 조정 */
  border-radius: 12px;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
  position: relative; /* X 버튼 위치 지정을 위해 추가 */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h4 {
    font-size: 1.5rem; /* 글씨 크기 조정 */
    font-weight: bold; /* 글씨 굵게 */
    margin: 0;
  }
`;

const CloseButtonContainer = styled.div`
  position: absolute;
  top: 15px; /* 상단에서부터의 거리 */
  right: 15px; /* 오른쪽에서부터의 거리 */
  z-index: 10; /* 다른 요소 위에 오도록 z-index 설정 */
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

const AuthorAndStatusRow = styled.div`
  display: flex;
  justify-content: space-between; /* 양쪽 끝으로 밀기 */
  align-items: center; /* 수직 중앙 정렬 */
  margin-bottom: 4px; /* 다음 InputGroup과의 간격 */
`;

// 작성자 텍스트 스타일
const AuthorText = styled.p`
  font-size: 0.9rem; /* 글씨 크기 줄이기 */
  color: #888; /* 회색 느낌으로 */
  margin: 0; /* 기본 마진 제거 */
`;

// "신규 일정" 또는 "일정 수정" 텍스트 스타일
const ScheduleStatusText = styled.p`
  font-size: 1.3rem; /* 조금 더 큰 글씨 */
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const InputGroup = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* 약간의 그림자 추가 */
`;

// 이미지에 맞춰 Input 스타일 변경: border-bottom과 padding 위주로
const StyledInput = styled.input`
  width: 100%;
  padding: 12px 0; /* 위아래 패딩 조정 */
  border: none;
  border-bottom: 1px solid #eee; /* 하단 경계선 추가 */
  outline: none; /* 포커스 시 아웃라인 제거 */
  font-size: 1rem; /* 폰트 사이즈 조정 */
  color: #333; /* 폰트 색상 */

  &:last-child {
    border-bottom: none; /* 마지막 input은 하단 경계선 제거 */
  }

  &::placeholder {
    color: #999;
  }
`;

// Selectbox와 Label 스타일
const StyledFormGroup = styled.div`
  margin-bottom: 20px;
  label {
    display: block;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 8px;
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  background-color: #fff;
  appearance: none; /* 기본 selectbox 스타일 제거 */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666' width='18px' height='18px'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E"); /* 커스텀 화살표 */
  background-repeat: no-repeat;
  background-position: right 10px center;
`;

// 버튼 스타일을 이미지에 맞춰 변경
const StyledButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 10px; /* 버튼 간 간격 */

  &.primary {
    background-color: #333; /* 이미지의 진한 회색 버튼 */
    color: #fff;
    border: none;

    &:hover {
      background-color: #555;
    }

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }

  &.danger {
    background-color: #fff; /* 이미지의 흰색 버튼 */
    color: #333; /* 폰트 색상은 검정 */
    border: 1px solid #ddd; /* 테두리 */

    &:hover {
      background-color: #f0f0f0;
    }
  }
`;

const ScheduleModal = ({
  date,
  members,
  initialData,
  onSave,
  onClose,
  onDeleteClick,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false); // 추가: 저장 버튼 상태 표시용
  const {profile} = useSelector((state)=>state.user);
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setAddress(initialData.address || '');
      setStartDatetime(initialData.startDatetime || '');
      setEndDatetime(initialData.endDatetime || '');
      setSelectedMemberIndex(initialData.userIndex || 0);
    } else {
      setTitle('');
      setDescription('');
      setAddress('');
      setStartDatetime(`${date}T`);
      setEndDatetime(`${date}T`);
      setSelectedMemberIndex(0);
    }
  }, [initialData, date]); // date를 의존성 배열에 추가하여 date 변경 시 초기화

  const handleSubmit = async () => {
    try {
      setIsSaving(true); // 저장중 상태 표시
      const coords = await fetchCoordinates(address);

      onSave({
        title,
        description,
        address,
        latitude: coords.latitude,
        longitude: coords.longitude,
        startDatetime,
        endDatetime,
        userIndex: selectedMemberIndex,
      });

      // 저장 성공 후 상태 초기화 (옵션)
      // setTitle('');
      // setDescription('');
      // setAddress('');
      // setStartDatetime(`${date}T`);
      // setEndDatetime(`${date}T`);
      // setSelectedMemberIndex(0);

      setIsSaving(false);
    } catch (error) {
      console.error('위치 좌표 변환 오류:', error);
      alert(
        '주소를 좌표로 변환하는 데 실패했습니다. 주소를 다시 확인해주세요.'
      );
      setIsSaving(false);
    }
  };

  // 날짜 포맷팅 (예: "4월 28일")
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
        <h4>{formatDate(date)}</h4> {/* 날짜 포맷팅 함수 적용 */}
        {/* <h4>
          {!initialData
            ? '신규 일정'
            : initialData.userIndex === true
            ? '일정 수정'
            : ''}
        </h4>{' '} */}
        {/* userIndex === true 로 수정/추가 분기했던 부분 간소화 */}
      </Header>
      <AuthorAndStatusRow>
        <AuthorText>
          작성자 :{' '}
          {initialData && initialData.creatorId
            ? members.find((m) => m.userId === initialData.creatorId)?.name ||
              ''
            : profile.name}{' '}
          {/* 신규 작성 시 authorName, 수정 시 creatorId 기반 이름 */}
        </AuthorText>
        <ScheduleStatusText>
           {' '}
          {!initialData
            ? '신규 일정'
            : initialData.userIndex === true
            ? '일정 수정'
            : ''}
        </ScheduleStatusText>
      </AuthorAndStatusRow>

      <InputGroup>
        <StyledInput
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <StyledInput
          placeholder="메모"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </InputGroup>

      <InputGroup>
        <StyledInput
          placeholder="위치"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <StyledInput
          placeholder="시작"
          type="datetime-local" // HTML5 datetime-local 타입 사용
          value={startDatetime}
          onChange={(e) => setStartDatetime(e.target.value)}
        />
        <StyledInput
          placeholder="종료"
          type="datetime-local" // HTML5 datetime-local 타입 사용
          value={endDatetime}
          onChange={(e) => setEndDatetime(e.target.value)}
        />
      </InputGroup>

      <StyledFormGroup>
        {/* <label htmlFor="member-select">참여자 선택</label>
        <StyledSelect
          id="member-select"
          value={selectedMemberIndex}
          onChange={(e) => setSelectedMemberIndex(parseInt(e.target.value))}
        >
          {members.map((member, idx) => (
            <option key={member.userId} value={idx}>
              {member.name}
            </option>
          ))}
        </StyledSelect> */}
      </StyledFormGroup>

      {/* 버튼 렌더링 로직: initialData 유무로 신규/수정 분기 */}
      {!initialData ? (
        // case 1: 신규 일정 (이미지에 '일정 추가' 버튼만 존재)
        <>
          <StyledButton
            className="primary"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? '저장중...' : '일정 추가'}
          </StyledButton>
          <StyledButton className="danger" onClick={onClose}>
            닫기
          </StyledButton>
        </>
      ) :  initialData.userIndex === true ?(
        // case 2: 기존 일정 (이미지에 '일정 삭제' 버튼만 존재)
        <>
          <StyledButton
            className="primary" // 수정 버튼도 primary 스타일로
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? '저장중...' : '일정 수정'}
          </StyledButton>
          <StyledButton
            className="danger" // 삭제 버튼은 흰색 스타일로
            onClick={() => onDeleteClick(initialData.scheduleId)}
          >
            일정 삭제
          </StyledButton>
        </>
      ) : <StyledButton className="primary" onClick={onClose}>
            닫기
          </StyledButton>}
    </ModalWrapper>
  );
};

export default ScheduleModal;
