import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { Person, Close, Search } from '@mui/icons-material';
import styled from 'styled-components';

const colors = ['#ff8a80', '#ffd180', '#ffff8d', '#ccff90', '#a7ffeb', '#80d8ff', '#b388ff'];

const FriendModal = ({ show, handleClose, onNext }) => {
  const { friendsList } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  const toggleFriendSelection = (friend) => {
    const exists = selectedFriends.find(f => f.userId === friend.userId);
    if (exists) {
      setSelectedFriends(selectedFriends.filter(f => f.userId !== friend.userId));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleRemove = (id) => {
    setSelectedFriends(selectedFriends.filter(f => f.userId !== id));
  };

  const filteredFriends = friendsList?.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getColor = (index) => colors[index % colors.length];

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>멤버 초대</Modal.Title>
        <div className="ms-auto fw-bold">{selectedFriends.length} 명 선택됨</div>
      </Modal.Header>

      <Modal.Body>
        {/* Selected User Chips */}
        <SelectedList>
          {selectedFriends.map((user, i) => (
            <Chip key={user.userId}>
              <Person style={{ color: getColor(i) }} />
              <span>{user.name}</span>
              <Close className="remove" onClick={() => handleRemove(user.userId)} />
            </Chip>
          ))}
        </SelectedList>

        {/* Search Input */}
        <SearchBox>
          <Search className="icon" />
          <input
            type="text"
            placeholder="이름(초성), 전화번호 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        {/* Friends List */}
        <FriendList>
          {filteredFriends.map((friend, i) => {
            const isSelected = selectedFriends.some(f => f.userId === friend.userId);
            return (
              <FriendItem key={friend.userId} onClick={() => toggleFriendSelection(friend)}>
                <Person style={{ color: getColor(i) }} />
                <span>{friend.name}</span>
                <input type="checkbox" checked={isSelected} readOnly />
              </FriendItem>
            );
          })}
        </FriendList>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          닫기
        </Button>
        <Button variant="primary" onClick={() => onNext(selectedFriends)}>
          다음
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FriendModal;


// 🔷 Styled Components
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
