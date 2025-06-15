import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faSearch,
  faUserCircle,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { fetchFriendsList, friendsAccept, friendsDecline, friendsPending, friendsRequest } from '../../features/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
const Sidebar = styled.div`
  width: 300px;
  background-color: #f5f6f8;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;
const UserSection = styled.div`
  margin-bottom: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.div`
  font-size: 36px;
  color: #888;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
`;

const Divider = styled.hr`
  margin-top: 12px;
  border: none;
  border-top: 1px solid #000;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 20px;
`;

const Icons = styled.div`
  display: flex;
  gap: 10px;
`;

const Icon = styled.div`
  cursor: pointer;
  font-size: 18px;
`;

const RequestSection = styled.div`
  background-color: #ffffff;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  position: relative;
  font-weight: 500;
`;

const RequestBadge = styled.span`
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 50%;
  padding: 3px 7px;
  font-size: 12px;
  position: absolute;
  right: 10px;
  top: 8px;
`;

const ListTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const FriendList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const FriendItem = styled.div`
  background-color: #fff;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #ccc;
  }
`;

const RequestButton = styled.button`
  padding: 8px 20px;
  background-color: #f1f1f1;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #e2e2e2;
  }
`;

const Status = styled.span`
  color: ${(props) => (props.isActive ? '#4caf50' : '#aaa')};
`;

const RequestItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 6px;
`;

const RequestInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const AcceptButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background-color: #43a047;
  }
`;

const DeclineButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background-color: #d32f2f;
  }
`;


const FriendSidebar = ({ friendRequests = [], friends = [] }) => {
  const {friendsRequestList = [], profile, friendsList} = useSelector((state)=>state.user);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [receiverEmail, setEmail] = useState('');
  const dispatch = useDispatch();
  const cookie = Cookies.get('JSESSIONID');
  const receievId = profile?.userId;
  const handleFriendRequest = () => {
    if (receiverEmail.trim()) {
      // 요청 로직 연결 (예: API 호출 또는 상태 업데이트)
      console.log(`친구 요청 전송: ${receiverEmail}`);
      dispatch(friendsRequest({receiverEmail, cookie}))
      setEmail('');
    } else {
      alert('아이디를 입력해주세요.');
      console.log("receievId",receievId);
    }
    console.log(friendsRequestList);
  };
  const handleAccept = async (requestId) => {
  console.log(`수락: ${requestId}`);
  await dispatch(friendsAccept({requestId, receievId}))
  dispatch(fetchFriendsList()); // 친구 목록 갱신
  dispatch(friendsPending()); // 요청 목록도 갱신
};

const handleDecline = async (requestId) => {
  console.log(`거절: ${requestId}`);
  await dispatch(friendsDecline({requestId, receievId}))
  dispatch(friendsPending()); // 요청 목록 갱신
}; // 실시간 친구 요청, 친구 목록 적용하는 로직 설계해야할듯.
  return (
    <Sidebar>
      <UserSection>
        <UserInfo>
          <UserAvatar>
            <FontAwesomeIcon icon={faUserCircle} />
          </UserAvatar>
          <UserName>{profile?.name}</UserName>
        </UserInfo>
        <Divider />
      </UserSection>
      <Header>
        <Title>친구</Title>
        <Icons>
          <Icon onClick={() => setShowAddModal(true)}>
            <FontAwesomeIcon icon={faUserPlus} />
          </Icon>
          <Icon>
            <FontAwesomeIcon icon={faSearch} />
          </Icon>
        </Icons>
      </Header>
    
      <RequestSection onClick={() => setShowRequestModal(true)}>
        친구 요청
        {friendsRequestList?.length > 0 && (
          <RequestBadge>{friendsRequestList?.length}</RequestBadge>
        )}
      </RequestSection>
      <Divider />
      <ListTitle>친구 목록 ({friendsList?.length})</ListTitle>
      <FriendList>
        {friendsList?.map((friend, index) => (
          <FriendItem key={index}>
            <span><FontAwesomeIcon icon={faUser} /> {friend?.name}</span>
            {/* <Status isActive={friend?.status === '게임 중'}>
              {friend?.status}
            </Status> */}
          </FriendItem>
        ))}
      </FriendList>

      {/* 친구 요청 모달 */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>친구 요청</Modal.Title>
        </Modal.Header>
        <Modal.Body>
  {(!friendsRequestList || friendsRequestList.length === 0) ? (
    '친구 요청이 없습니다.'
  ) : (
    friendsRequestList.map((req, idx) => (
      <RequestItem key={idx}>
        <RequestInfo>
          <FontAwesomeIcon icon={faUser} />
          <span><strong>{req.name}</strong> 님이 친구 요청을 보냈습니다.</span>
        </RequestInfo>
        <ActionButtons>
          <AcceptButton onClick={() => handleAccept(req.userId)}>수락</AcceptButton>
          <DeclineButton onClick={() => handleDecline(req.userId)}>거절</DeclineButton>
        </ActionButtons>
      </RequestItem>
    ))
  )}
</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRequestModal(false)}
          >
            닫기
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 친구 추가 모달 */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>친구 추가</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputContainer>
            <Input
              type="email"
              placeholder="이메일을 입력해주세요."
              value={receiverEmail}
              onChange={(e) => setEmail(e.target.value)}
            />
            <RequestButton onClick={handleFriendRequest}>요청</RequestButton>
          </InputContainer>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </Sidebar>
  );
};

export default FriendSidebar;
