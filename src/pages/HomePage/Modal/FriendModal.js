import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { Person, Close, Search } from '@mui/icons-material';
import styled from 'styled-components';
import { createCalendar } from '../../../features/calendar/calendarSlice';
import { useNavigate } from 'react-router-dom';

const colors = [
  '#ff8a80',
  '#ffd180',
  '#ffff8d',
  '#ccff90',
  '#a7ffeb',
  '#80d8ff',
  '#b388ff',
];

const FriendModal = ({ show, handleClose }) => {
  const dispatch = useDispatch();
  const { friendsList } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [calendarName, setCalendarName] = useState('');

  const handleRemove = (id) => {
    setSelectedFriends(selectedFriends.filter((f) => f.userId !== id));
  };

  const handleCreateCalendar = async () => {
    if (!groupName.trim() || !calendarName.trim()) {
      alert('그룹명과 캘린더명을 모두 입력해주세요.');
      return;
    }

    const memberIds = selectedFriends.map((f) => f.userId);
    console.log(
      'groupName,calendarName,memberIds',
      groupName,
      calendarName,
      memberIds
    );
    try {
      const resultAction = await dispatch(
        createCalendar({ groupName, calendarName, memberIds })
      );

      if (createCalendar.fulfilled.match(resultAction)) {
        const groupId = resultAction.payload.groupId; // 서버에서 반환되는 그룹 ID
        handleClose();
        resetState();
        navigate(`/calendar/${groupId}`); // 그룹 캘린더 페이지로 이동
      }
    } catch (e) {
      console.error('캘린더 생성 중 오류:', e);
    }
  };

  const resetState = () => {
    setStep(1);
    setSearchTerm('');
    setSelectedFriends([]);
    setGroupName('');
    setCalendarName('');
  };

  const toggleFriendSelection = (friend, index) => {
    const exists = selectedFriends.find((f) => f.userId === friend.userId);
    if (exists) {
      setSelectedFriends(
        selectedFriends.filter((f) => f.userId !== friend.userId)
      );
    } else {
      setSelectedFriends([
        ...selectedFriends,
        { ...friend, colorIndex: index % colors.length },
      ]);
    }
  };

  const filteredFriends =
    friendsList?.filter((f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>멤버 초대</Modal.Title>
        {step === 1 && (
          <div className="ms-auto fw-bold">
            {selectedFriends.length} 명 선택됨
          </div>
        )}
      </Modal.Header>

      <Modal.Body>
        {step === 1 ? (
          <>
            <SelectedList>
              {selectedFriends.map((user, i) => (
                <Chip key={user.userId}>
                  <Person style={{ color: colors[user.colorIndex] }} />
                  <span>{user.name}</span>
                  <Close
                    className="remove"
                    onClick={() => handleRemove(user.userId)}
                  />
                </Chip>
              ))}
            </SelectedList>

            <SearchBox>
              <Search className="icon" />
              <input
                type="text"
                placeholder="이름(초성), 전화번호 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>

            <FriendList>
              {filteredFriends.map((friend, i) => {
                const isSelected = selectedFriends.some(
                  (f) => f.userId === friend.userId
                );
                return (
                  <FriendItem
                    key={friend.userId}
                    onClick={() => toggleFriendSelection(friend, i)}
                  >
                    <Person style={{ color: colors[i % colors.length] }} />
                    <span>{friend.name}</span>
                    <input type="checkbox" checked={isSelected} readOnly />
                  </FriendItem>
                );
              })}
            </FriendList>
          </>
        ) : (
          <InputSection>
            <label>그룹 이름</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="예: 프로젝트 팀, 동아리 등"
            />
            <label className="mt-3">캘린더 이름</label>
            <input
              type="text"
              value={calendarName}
              onChange={(e) => setCalendarName(e.target.value)}
              placeholder="예: 일정 공유, 활동 계획 등"
            />
          </InputSection>
        )}
      </Modal.Body>

      <Modal.Footer>
        {step === 1 ? (
          <Button variant="secondary" onClick={handleClose}>
            닫기
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={selectedFriends.length === 0}
            onClick={() => setStep(1)}
          >
            이전
          </Button>
        )}

        {step === 1 ? (
          <Button
            variant="primary"
            disabled={selectedFriends.length === 0}
            onClick={() => setStep(2)}
          >
            다음
          </Button>
        ) : (
          <Button variant="success" onClick={handleCreateCalendar}>
            캘린더 생성
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default FriendModal;

// Styled Components
const SelectedList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 1rem;
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  background-color: #f1f3f5;
  padding: 6px 10px;
  border-radius: 20px;
  gap: 5px;

  .remove {
    cursor: pointer;
    font-size: 1rem;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f0f0f0;
  padding: 6px 10px;
  border-radius: 8px;
  margin-bottom: 1rem;

  .icon {
    margin-right: 6px;
  }

  input {
    border: none;
    outline: none;
    background: transparent;
    flex: 1;
  }
`;

const FriendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-height: 300px;
  overflow-y: auto;
`;

const FriendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fafafa;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #efefef;
  }

  span {
    flex-grow: 1;
    margin-left: 10px;
  }
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  input {
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ddd;
    outline: none;
  }

  label {
    font-weight: bold;
  }
`;
