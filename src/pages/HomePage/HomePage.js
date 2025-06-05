import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import FriendModal from './Modal/FriendModal';
import { useNavigate } from 'react-router-dom';
import { FaUserFriends, FaEllipsisV } from 'react-icons/fa';
import { fetchCalendarList } from '../../features/calendar/calendarSlice';
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const TitleSection = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
  background-color: #f9fafb;
  height: 400px;
`;

const MainTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const SubTitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;

  button {
    padding: 10px 20px;
    font-size: 1rem;
    border-radius: 8px;
    border: 1px solid black;
    cursor: pointer;
  }

  .create {
    background-color: #e0e0e0;
    color: black;
  }

  .search {
    background-color: black;
    color: white;
  }
`;

const GroupSection = styled.section`
  margin-top: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const GroupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
`;

const GroupCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Emoji = styled.span`
  font-size: 1.2rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateText = styled.span`
  font-size: 0.8rem;
  color: #999;
`;

const MenuWrapper = styled.div`
  position: relative;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: 1.5rem;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  z-index: 10;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  align-items: center;
`;

const TagIcon = styled(FaUserFriends)`
  color: #888;
`;

const Tag = styled.span`
  background-color: #e0f2ff;
  color: #007acc;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  border-radius: 999px;
  font-weight: 500;

  &:nth-child(2n) {
    background-color: #ffe9d6;
    color: #e67e22;
  }

  &:nth-child(3n) {
    background-color: #e0ffe9;
    color: #009e60;
  }

  &:nth-child(4n) {
    background-color: #f0e8ff;
    color: #7a49d1;
  }
`;

const EnterButton = styled.button`
  margin-top: 1rem;
  align-self: flex-end;
  background-color: #000;
  color: #fff;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;
const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const { profile } = useSelector((state) => state.user);
  const { calendarList } = useSelector((state) => state.calendar);
  const handleCreateCalender = () => {
    setShowModal(true);
  };
  const getEmojiByGroupId = (groupId) => {
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return emojis[(groupId - 1) % emojis.length];
  };

  const handleDelete = (groupId) => {
    console.log("Delete group:", groupId);
    // 삭제 로직 추가
  };
  useEffect(() => {
    dispatch(fetchCalendarList()); // 비동기 캘린더 가져오기
  }, [dispatch]);
  
  return (
    <Container>
      <TitleSection>
        <MainTitle>공유 캘린더</MainTitle>
        <SubTitle>일정을 공유하고 약속을 잡으세요</SubTitle>
        <ButtonGroup>
          <button className="create" onClick={handleCreateCalender}>
            캘린더 생성
          </button>
          <button className="search">약속장소 찾기</button>
        </ButtonGroup>
      </TitleSection>

      <GroupSection>
        <SectionTitle>소속 그룹</SectionTitle>
        <GroupGrid>
  {Array.isArray(calendarList) && calendarList.length > 0 ? (
    calendarList.map((item, idx) => {
      const emoji = getEmojiByGroupId(item?.groupId);
      const isOwner = item?.ownerId === profile.userId;
      const formattedDate = new Date(item?.createdAt).toLocaleDateString();

      return (
        <GroupCard key={idx} onClick={() => navigate(`/calendar/${item?.groupId}`)}>
          <CardHeader>
            <HeaderLeft>
              <Emoji>{emoji}</Emoji>
            </HeaderLeft>

            <HeaderRight>
              <DateText>{formattedDate}</DateText>
              {isOwner && (
                <MenuWrapper onClick={(e) => e.stopPropagation()}>
                  <MenuButton onClick={() => setOpenDropdownIndex(idx)}>
                    <FaEllipsisV />
                  </MenuButton>
                  {openDropdownIndex === idx && (
                    <Dropdown>
                      <button onClick={() => console.log('삭제')}>삭제</button>
                    </Dropdown>
                  )}
                </MenuWrapper>
              )}
            </HeaderRight>
          </CardHeader>

          <h4>
            <strong>“{item?.calendarName}”</strong>
          </h4>

          <TagList>
            <TagIcon />
            {item?.members.map((member, index) => (
              <Tag key={index}>{member.name}</Tag>
            ))}
          </TagList>

          <EnterButton
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/calendar/${item?.groupId}`);
            }}
          >
            입장
          </EnterButton>
        </GroupCard>
      );
    })
  ) : (
    <p>소속된 그룹이 없습니다. 캘린더를 생성해보세요!</p>
  )}
</GroupGrid>
      </GroupSection>
      <FriendModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onNext={(selectedFriends) => {
          console.log(
            '선택된 친구들:',
            selectedFriends.map((f) => f.id)
          );
          setShowModal(false);
          // 다음 로직 처리
        }}
      />
    </Container>
  );
};

export default HomePage;
