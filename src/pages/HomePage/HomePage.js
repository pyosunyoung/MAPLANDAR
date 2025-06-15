import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import FriendModal from './Modal/FriendModal';
import { useNavigate } from 'react-router-dom';
import { FaUserFriends, FaEllipsisV } from 'react-icons/fa';
import { deleteCalendar, fetchCalendarList } from '../../features/calendar/calendarSlice';

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
  font-size: 1.8rem; /* 폰트 크기 키움 */
  font-weight: 700; /* 더 두껍게 */
  color: #222; /* 좀 더 진한 색상 */
  margin-bottom: 1.5rem; /* 아래 여백 증가 */
  position: relative; /* 가상 요소를 위한 position 설정 */
  padding-bottom: 0.5rem; /* 밑줄과 텍스트 사이 간격 */

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 60px; /* 밑줄 길이 */
    height: 4px; /* 밑줄 두께 */
    background-color: #000; /* 검은색 밑줄 */
    border-radius: 2px; /* 밑줄 끝을 둥글게 */
  }
`;

const GroupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem; /* 간격 조정 */
`;

const GroupCard = styled.div`
  background-color: #fff;
  border-radius: 12px; /* 더 둥근 모서리 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 그림자 추가 */
  overflow: hidden; /* 내용이 넘치지 않도록 */
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px); /* 호버 시 살짝 위로 */
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
`;

const CalendarHeader = styled.div`
  background-color: #333; /* 어두운 회색 */
  color: white;
  padding: 0.8rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

const CalendarDate = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GroupNumber = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #555; /* 그룹 숫자의 배경색 */
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
`;

const CalendarDay = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const CardContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* 내용이 카드 높이 전체를 차지하도록 */
  justify-content: space-between;
`;

const CardTitle = styled.h4`
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: #333;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem; /* 태그 간격 조정 */
  margin-top: 0.75rem;
  align-items: center;
  min-height: 40px; /* 태그가 없을 때도 공간 유지 */
`;

const TagIcon = styled(FaUserFriends)`
  color: #888;
  font-size: 1rem;
`;

const Tag = styled.span`
  background-color: #f0e8ff;/* 연한 회색 배경 */
  color: #7a49d1;
 /* 진한 회색 글씨 */
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem; /* 폰트 사이즈 조정 */
  border-radius: 20px; /* 더 둥근 태그 */
  font-weight: 500;
  white-space: nowrap; /* 태그가 줄바꿈되지 않도록 */
  border: 1px solid #ddd; /* 옅은 테두리 추가 */

  /* 회색/검은색/흰색 테마에 맞춘 다양한 태그 색상 */
  &:nth-child(2n) {
    background-color: #FCE3E3;
    color: #C14444;
  }
  &:nth-child(3n) {
    
    background-color: #ffe9d6;
    color: #e67e22;
  }
  &:nth-child(4n) {
    background-color:#e0f2ff;
    color: #007acc;
  }
`;

const EnterButton = styled.button`
  margin-top: 1rem;
  align-self: flex-end;
  background-color: #000; /* 검은색 버튼 */
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem; /* 패딩 조정 */
  border-radius: 25px; /* 더 둥근 버튼 */
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #333; /* 호버 시 진한 회색 */
  }
`;

const MenuWrapper = styled.div`
  position: relative;
  margin-left: auto; /* 우측 정렬 */
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: white; /* 캘린더 헤더에 맞춰 흰색 */
  font-size: 1rem;
  padding: 0.3rem; /* 클릭 영역 확보 */
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: 2rem; /* 버튼 아래로 배치 */
  background-color: white;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  z-index: 10;

  button {
    width: 100%;
    background: none;
    border: none;
    padding: 0.6rem 1rem;
    text-align: left;
    cursor: pointer;
    font-size: 0.9rem;
    color: #333;
    &:hover {
      background-color: #f5f5f5;
    }
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

  // groupId를 기반으로 숫자를 반환하도록 변경
  const getGroupNumber = (groupId) => {
    return (groupId % 100) || 1; // 간단하게 그룹 ID의 마지막 두 자리 또는 1
  };

  const getDayOfWeek = (dateString) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const handleDeleteCalendar = async (groupId) => {
    console.log("Delete group:", groupId);
    await dispatch(deleteCalendar(groupId)).unwrap();
    await dispatch(fetchCalendarList());
  };

  useEffect(() => {
    dispatch(fetchCalendarList());
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
        <SectionTitle>소속 그룹</SectionTitle> {/* 디자인이 적용된 SectionTitle */}
        <GroupGrid>
          {Array.isArray(calendarList) && calendarList.length > 0 ? (
            calendarList.map((item, idx) => {
              const groupNumber = getGroupNumber(item?.groupId); // 이모지 대신 숫자 사용
              const isOwner = item?.ownerId === profile?.userId;
              const createdAtDate = new Date(item?.createdAt);
              const formattedMonthDay = `${createdAtDate.getMonth() + 1}/${createdAtDate.getDate()}`;
              const formattedDayOfWeek = getDayOfWeek(item?.createdAt);

              return (
                <GroupCard key={idx} onClick={() => navigate(`/calendar/${item?.groupId}`)}>
                  <CalendarHeader>
                    <CalendarDate>
                      <GroupNumber>{groupNumber}</GroupNumber> {/* 숫자 컴포넌트 사용 */}
                      <span>{formattedMonthDay}</span>
                      <CalendarDay>({formattedDayOfWeek})</CalendarDay>
                    </CalendarDate>
                    {isOwner && (
                      <MenuWrapper onClick={(e) => e.stopPropagation()}>
                        <MenuButton onClick={() => setOpenDropdownIndex((prev) => (prev === idx ? null : idx))}>
                          <FaEllipsisV />
                        </MenuButton>
                        {openDropdownIndex === idx && (
                          <Dropdown>
                            <button onClick={() => handleDeleteCalendar(item?.groupId)}>삭제</button>
                          </Dropdown>
                        )}
                      </MenuWrapper>
                    )}
                  </CalendarHeader>

                  <CardContent>
                    <CardTitle>
                      “{item?.calendarName}”
                    </CardTitle>

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
                  </CardContent>
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