import React, { useEffect, useRef, useState } from 'react';
import { data, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import { Button, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaCalendarAlt } from 'react-icons/fa';
import styled from 'styled-components';
import image from '../../common/images/장소 추천.gif';
import {
  fetchCalendarDetail,
  fetchSchedules,
  updateGroupName,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  fetchSingleSchedules,
  fetchSchedulesByDate,
  loactionRecommend,
} from '../../features/calendar/calendarSlice';
import ScheduleListModal from './components/ScheduleListModal';
import ScheduleModal from './components/ScheduleModal';
import PlaceRecommendationModal from './components/PlaceRecommendationModal';
import LoadingModal from './components/LoadingModal';

// 참여자별 색상 매핑 예시
const userColors = [
  '#F7B7B7',
  '#FAD6A5',
  '#A5D8FA',
  '#D5A5FA',
  '#A5FAD6',
  '#FAE3A5',
  '#FFA5A5',
  '#A5F3FA',
  '#D6A5FA',
  '#FAD6E1',
  '#C2F7B7',
  '#F9D9A9',
  '#A9D9F9',
  '#D9A9F9',
  '#A9F9D9',
  '#F7A9A9',
  '#A9F7F7',
  '#E1D6FA',
  '#FAD6B7',
  '#C1A5FA',
  '#FAF3A5',
  '#B7A5FA',
  '#A5FAE3',
  '#FAD7C5',
  '#B7F7D6',
  '#F7D6F2',
  '#A5C2FA',
  '#F7F7A5',
  '#A5FAFA',
  '#F2C5F7',
];

const Container = styled.div`
  display: flex;
  padding: 20px;
`;

const MainContent = styled.div`
  flex: 3;
`;

const Sidebar = styled.div`
  margin-left: 20px;
  
`;

// 캘린더 외 영역을 덮는 오버레이
const FullCalendarWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 1000px; /* 캘린더 최대 너비 설정 */
  margin: 20px auto; /* 중앙 정렬 */
  border-radius: 12px; /* 전체 캘린더 컨테이너 둥글게 */
  overflow: hidden; /* 둥근 모서리 밖으로 내용 안 넘치도록 */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); /* 캘린더 전체 그림자 */
  font-family: 'AppleSDGothicNeo', 'Noto Sans KR', sans-serif; /* 폰트 지정 */
  
    /* 상단 헤더 (2025년 6월, 오늘, < > 버튼 포함) */
  .fc .fc-toolbar.fc-header-toolbar {
    background-color: #343a40; /* 상단 헤더 배경색 (어두운 회색) */
    padding: 15px 25px; /* 패딩 */
    margin-bottom: 0 !important; /* 여기 마진 제거 */
    border-radius: 12px 12px 0 0; /* 상단만 둥글게 */
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .fc .fc-toolbar-title {
    
    font-size: 1.8em; /* 날짜 제목 크기 */
    font-weight: 700; /* 날짜 제목 굵게 */
    color: #ffffff; /* 날짜 제목 색상 흰색 */
  }

  /* 캘린더 헤더 (월, 화, 수...) */
  .fc-theme-standard .fc-scrollgrid {
    border: none; /* 기본 경계선 제거 */
  }

  .fc-theme-standard th {
    background-color: #f0f0f0; /* 요일 헤더 배경색 */
    color: #555555; /* 요일 글자색 */
    font-weight: 600;
    
    border-right: 1px solid #e0e0e0; /* 요일 구분선 */
    &:last-child {
      border-right: none;
    }
  }
  
  /* 이전, 다음 버튼 및 날짜 표시 헤더 */
  .fc .fc-toolbar.fc-header-toolbar {
    background-color: #343a40; /* 상단 헤더 배경색 (어두운 회색) */
    padding: 15px 25px; /* 패딩 */
    border-bottom: none; /* 하단 경계선 제거 */
    border-radius: 12px 12px 0 0; /* 상단만 둥글게 */
  }

  /* 이전/다음 버튼 */
  .fc .fc-button-group .fc-button {
    background-color: transparent;
    border: none;
    color: #ffffff; /* 버튼 아이콘 색상 흰색 */
    font-size: 1.5em; /* 버튼 아이콘 크기 */
    padding: 0 10px;
    opacity: 0.8;
    transition: opacity 0.2s ease;
    &:hover {
      opacity: 1;
      background-color: rgba(255, 255, 255, 0.1); /* 호버 시 약간 밝게 */
      border-radius: 5px;
    }
  }

  /* 날짜 셀 */
  .fc .fc-daygrid-day {
    
    border: 1px solid #f0f0f0; /* 셀 경계선 */
    border-width: 1px 1px 1px 0; /* 우측과 하단에만 경계선 */
    
    &:nth-child(7n) { /* 일요일 */
      border-right: none;
    }
    &:nth-last-child(-n + 7) { /* 마지막 주 */
      border-bottom: none;
    }
  }

  /* 현재 달이 아닌 날짜 */
  .fc .fc-daygrid-day-other .fc-daygrid-day-top {
    opacity: 0.5; /* 현재 달이 아닌 날짜 흐리게 */
  }

  /* 날짜 숫자 */
  .fc .fc-daygrid-day-top {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 8px; /* 날짜 숫자 상단 패딩 */
    font-size: 1.2em; /* 날짜 숫자 크기 */
    font-weight: 500;
    color: #333333; /* 날짜 숫자 색상 */
  }
  
  /* 오늘 날짜 셀 */
  .fc .fc-day-today {
  
    background-color: #e6f7ff; /* 오늘 날짜 배경색 */
    border-color: #91d5ff; /* 오늘 날짜 경계선 색상 */
    box-shadow: inset 0 0 0 2px #91d5ff; /* 강조 테두리 */
  }

  /* 이벤트 스타일 */
  .fc-event {
  
    border-radius: 5px; /* 이벤트 모서리 둥글게 */
    padding: 3px 6px; /* 이벤트 내부 패딩 */
    margin-bottom: 3px; /* 이벤트 간 간격 */
    font-size: 0.85em; /* 이벤트 텍스트 크기 */
    color: #333333; /* 이벤트 텍스트 색상 */
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
  }

  /* FullCalendar 자체 오버레이 숨기기 (원하는 경우) */
  // .fc-popover {
  //   z-index: 1000; /* 오버레이 z-index */
  
  // }
  .fc a {
    text-decoration: none !important;
    color: inherit;
  }

`;

// 캘린더 영역만 덮는 오버레이
const CalendarOverlay = styled.div`
  ${(props) =>
    props.$showOverlay &&
    `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4); /* 회색 반투명 오버레이 */
    z-index: 1; /* FullCalendar 위에 오도록 설정 */
    pointer-events: auto; /* 오버레이 클릭 가능 (클릭 시 캘린더 클릭 막기) */
  `}
`;
const Overlay = styled.div`
  ${(props) =>
    props.$showOverlay &&
    `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4); /* 회색 반투명 오버레이 */
    // z-index: 10; /* FullCalendar 위에 오도록 설정 */
    pointer-events: auto; /* 오버레이 클릭 가능 (클릭 시 캘린더 클릭 막기) */
  `}
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
`;

const GroupTitleInput = styled.input`
  font-size: 24px;
  margin-right: 10px;
  padding: 8px 12px; /* 패딩을 더 주어 입력 필드를 더 보기 좋게 */
  border: 1px solid #ced4da;
  border-radius: 0.375rem; /* 조금 더 둥근 모서리 */
  box-shadow: inset 0 1px 2px rgba(0,0,0,.075);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  &:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(0,123,255,.25);
  }
`;

// ✨ 디자인이 강화된 그룹명 섹션 ✨
const StyledGroupNameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px; /* 아이콘과 텍스트 사이 간격 */
  margin-right: 15px; /* 편집 아이콘과의 간격 조정 */
  padding: 5px 0; /* 세로 패딩으로 공간감 부여 */
  /* background-color: #f8f9fa; /* 배경색으로 섹션 강조 (선택 사항) */
  /* border-radius: 8px; /* 배경색 사용 시 둥근 모서리 */
  /* padding: 10px 15px; */ /* 배경색 사용 시 패딩 */
`;

const StyledCalendarIcon = styled(FaCalendarAlt)` /* FaCalendarAlt 아이콘 스타일링 */
  font-size: 26px; /* 아이콘 크기 */
  color: black; /* 메인 색상 (파란색) 또는 어울리는 색상 */
  /* background-color: #e9f5ff; */ /* 아이콘 배경 (선택 사항) */
  /* padding: 6px; */
  /* border-radius: 50%; */
`;

const StyledGroupNameText = styled.h2`
  font-size: 32px; /* 제목 폰트 크기를 더 키웁니다 */
  font-weight: 800; /* 매우 두껍게 */
  color: #212529; /* 거의 검정에 가까운 진한 색상 */
  margin: 0; /* h2 기본 마진 제거 */
  letter-spacing: -0.7px; /* 한글 자간 조정 */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05); /* 은은한 텍스트 그림자 */
`;

const StyledEditIcon = styled(FaEdit)`
  font-size: 20px; /* 편집 아이콘 크기 */
  color: #6c757d; /* 회색 톤 */
  cursor: pointer;
  transition: color 0.2s ease-in-out;
  &:hover {
    color: #007bff; /* 호버 시 색상 변경 */
  }
`;


// const ParticipantBox = styled.div`
//   background: #f9f9f9;
//   border-radius: 10px;
//   padding: 10px;
//   margin-bottom: 20px;
//   width: 200px;
// `;
const ParticipantBox = styled.div`
  background: #ffffff; /* 배경색을 흰색으로 변경하여 더 깔끔하게 */
  border-radius: 12px; /* 모서리 둥글기를 좀 더 크게 */
  padding: 15px 20px; /* 패딩을 좀 더 여유롭게 */
  margin-bottom: 20px;
  width: 250px; /* 너비를 약간 넓혀서 내용이 여유롭게 보이도록 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 그림자 추가하여 입체감 부여 */
  font-family: 'AppleSDGothicNeo', 'Noto Sans KR', sans-serif; /* 폰트 지정 */
`;

const ParticipantHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px; /* 헤더와 목록 사이 간격 */
  border-bottom: 1px solid #f0f0f0; /* 하단 경계선 추가 */
  padding-bottom: 10px; /* 경계선 아래 패딩 */
`;

const ParticipantTitle = styled.p`
  font-weight: bold;
  font-size: 1.1em; /* 폰트 크기 약간 키움 */
  color: #333333; /* 글자색 진하게 */
  margin: 0; /* 기본 마진 제거 */
`;

const ParticipantCount = styled.span`
  font-size: 0.9em;
  color: #888888;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 15px;
`;

const ParticipantList = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: 0; /* 기본 마진 제거 */
`;

const ParticipantItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f9f9f9; /* 각 항목 하단에 옅은 경계선 */
  &:last-child {
    border-bottom: none; /* 마지막 항목은 경계선 없음 */
  }
  transition: background-color 0.2s ease-in-out; /* 호버 시 배경색 변경 애니메이션 */

  &:hover {
    background-color: #f5f5f5; /* 호버 시 배경색 변경 */
    border-radius: 5px; /* 호버 시 둥근 모서리 */
  }
`;

const ColorBar = styled.div`
  width: 6px; /* 색깔 바 너비 */
  height: 20px; /* 색깔 바 높이 */
  background-color: ${(props) => props.color}; /* props로 색상 전달 */
  border-radius: 3px; /* 색깔 바 모서리 둥글게 */
  margin-right: 10px; /* 색깔 바와 이름 사이 간격 */
`;

const MemberName = styled.span`
  font-size: 1em;
  color: #555555; /* 멤버 이름 글자색 */
  flex-grow: 1; /* 이름이 남은 공간을 차지하도록 */
`;

// const MapBox = styled.div`
//   background: #f9f9f9;
//   border-radius: 10px;
//   padding: 10px;
//   height: 200px;
//   text-align: center;
//   line-height: 180px;
//   width: 200px;
//   /* 여기에 배경 이미지 관련 스타일 추가 */
//   background-image: url(https://cdn-icons-gif.flaticon.com/12322/12322385.gif); /* import한 이미지를 url() 안에 넣습니다. */
//   background-size: cover; /* 이미지가 MapBox를 꽉 채우도록 설정 (필요에 따라 contain, auto 등 조절) */
//   background-position: center; /* 이미지를 중앙에 배치 */
//   background-repeat: no-repeat; /* 이미지 반복 없음 */
// `;
const mapGifUrl = 'https://cdn-icons-gif.flaticon.com/12322/12322385.gif';

const RecommendationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa; /* 전체 배경색을 살짝 밝게 */
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); /* 그림자 강화 */
  width: 250px; /* 컨테이너 너비 확장 */
  margin: 20px auto; /* 중앙 정렬 */
  font-family: 'AppleSDGothicNeo', 'Noto Sans KR', sans-serif;
`;

const MapBox = styled.div`
  background: #ffffff; /* 배경색을 흰색으로 변경하여 더 깔끔하게 */
  border-radius: 15px; /* 모서리 둥글기를 더 크게 */
  padding: 20px; /* 내부 패딩 추가 */
  width: 100%; /* 부모 컨테이너에 맞춰 너비 조절 */
  height: 200px; /* 높이 고정 */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* 이미지 넘침 방지 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* 맵 박스 내부 그림자 */
  margin-bottom: 20px; /* 맵 박스와 설명 사이 간격 */

  img {
    max-width: 100%; /* 이미지가 박스를 넘지 않도록 */
    max-height: 100%; /* 이미지가 박스를 넘지 않도록 */
    object-fit: contain; /* 이미지 비율 유지하며 박스에 맞춤 */
    animation: bounce 2s infinite ease-in-out; /* 바운스 애니메이션 추가 */
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const DescriptionBox = styled.div`
  background-color: #e9ecef; /* 설명 박스 배경색 */
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px; /* 설명과 버튼 사이 간격 */
  text-align: center;
  color: #495057;
  font-size: 0.95em;
  line-height: 1.5;
`;

const RecommendButton = styled.button`
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${(props) => (props.variant === 'danger' ? '#dc3545' : '#6c757d')}; /* 모드에 따라 버튼 색상 변경 */
  color: #ffffff; /* 버튼 글자색 */

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px); /* 호버 시 살짝 올라오는 효과 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0); /* 클릭 시 원위치 */
  }

  .rocket-icon {
    margin-left: 8px;
    font-size: 1.2em; /* 로켓 아이콘 크기 */
    animation: launch 1s infinite alternate; /* 로켓 발사 애니메이션 */
  }

  @keyframes launch {
    0% {
      transform: translateX(0) translateY(0);
    }
    100% {
      transform: translateX(5px) translateY(-5px);
    }
  }
`;
const PlaceRecommendModalContent = styled.div`
  background: #f8f8f8;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const PlaceRecommendModalHeader = styled.div`
   display: flex;
  flex-direction: column; /* 제목과 설명이 세로로 정렬되도록 */
  align-items: center; /* 가운데 정렬 */
  margin-bottom: 20px;
  text-align: center;

  h4 {
    font-size: 1.3rem; /* 헤더 크기 조절 */
    font-weight: bold;
    margin-bottom: 5px; /* 제목과 설명 사이 간격 */
    color: #333;
  }

  p {
    font-size: 0.85rem;
    color: #777;
    margin: 0;
  }
`;
const PlaceTypeButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 10px 20px 20px 0;
`;

const PlaceTypeButton = styled.button`
  padding: 6px 12px;
  font-size: 14px;
  border: none;
  border-radius: 20px;
  background-color: ${({ $isActive }) => ($isActive ? '#F7B7B7' : '#f0f0f0')};
  color: ${({ $isActive }) => ($isActive ? '#A83232' : '#555')};
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ $isActive }) => ($isActive ? '#f49c9c' : '#e0e0e0')};
  }
`;
const PlaceInfoList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 5px;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const PlaceInfoItem = styled.label`
  background: #fff;
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 1px solid ${(props) => (props.$isSelected ? '#007bff' : '#eee')};

  &:hover {
    background-color: #f0f8ff;
  }

  input[type="checkbox"] {
    margin-right: 10px;
    transform: scale(1.2);
  }

  div {
    flex-grow: 1;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    color: #333;
  }

  span {
    font-size: 0.85rem;
    color: #777;
  }
`;

const SelectButton = styled(Button)`
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  background-color: #343a40;
  border-color: #343a40;
  border-radius: 8px;
  
  &:hover {
    background-color: #23272b;
    border-color: #23272b;
  }

  &:disabled {
    background-color: #6c757d;
    border-color: #6c757d;
    cursor: not-allowed;
  }
`;
const CloseButtonContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 20;
`;

const CloseButton = styled.button`
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: #555;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #e0e0e0;
    color: #333;
  }
`;

const CustomDayCell = styled.div`
  text-align: center;
  color:black;
`;

const GroupCalendarPage = () => {
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { calendarDetail, schedules, loading, singleSchedules } = useSelector(
    (state) => state.calendar
  );
  const { profile } = useSelector((state) => state.user);
  const [showListModal, setShowListModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  // 장소 추천 모드 관련 상태 추가
  const [isPlaceRecommendationMode, setIsPlaceRecommendationMode] =useState(false);
  const [showPlaceInfoModal, setShowPlaceInfoModal] = useState(false);
  const [placeInfoForDate, setPlaceInfoForDate] = useState([]); // 선택된 날짜의 장소 정보
  const calendarRef = useRef();
    // 장소 선택 모달 내부에서 사용할 상태
  const [selectedUserPlaces, setSelectedUserPlaces] = useState([]);

  // 새로운 상태 추가: 로딩 모달, 결과 모달, 추천 결과 데이터
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);

  const [selectedPlaceType, setSelectedPlaceType] = useState('cafes'); // 기본값: 카페
   const [selectedPlaceTypeKR, setSelectedPlaceTypeKR] = useState('카페'); // 기본값: 카페
  useEffect(() => {
    dispatch(fetchCalendarDetail(groupId));
    dispatch(fetchSchedules(groupId));
    console.log('스케줄 데이터', schedules);
  }, [dispatch, groupId]);

  //그룹명 수정
  const handleTitleEditClick = () => {
    setEditedTitle(calendarDetail?.groupName);
    setIsEditingTitle(true);
  };
  //그룹명 수정
  const handleTitleSave = () => {
    dispatch(updateGroupName({ groupId, groupName: editedTitle }));
    setIsEditingTitle(false);
  };

  // 날짜 클릭 핸들러 (장소 추천 모드에 따라 다르게 동작)
  const handleDateClick = (arg) => {
    const clickedDate = arg.dateStr;
    setSelectedDate(clickedDate);
    // dispatch(fetchSchedulesByDate({groupId, clickedDate}))
    if (isPlaceRecommendationMode) {
      // 장소 추천 모드일 때
      const schedulesForDate = schedules.filter(
        (s) => s.startDatetime.split('T')[0] === clickedDate
      );
      // 필터링된 일정들에서 장소 정보만 추출
      const extractedPlaceInfo = schedulesForDate
        .map((s) => ({
          userName:
            calendarDetail.members.find((m) => m.userId === s.creatorId)
              ?.name || '알 수 없음',
          address: s.address,
          latitude: s.latitude,
          longitude: s.longitude,
        }))
        .filter((info) => info.address); // 주소 정보가 있는 경우만 포함

      setPlaceInfoForDate(extractedPlaceInfo);
      setShowPlaceInfoModal(true); // 장소 정보 모달 열기
      setIsPlaceRecommendationMode(false); // 모달이 뜨면 장소 추천 모드 해제 (요청에 따라)
    } else {
      // 일반 모드일 때 (기존 로직)
      const schedulesForDate = schedules.filter(
        (s) => s.startDatetime.split('T')[0] === clickedDate
      );
      console.log(schedulesForDate);
      setSelectedSchedules(schedulesForDate);
      if (schedulesForDate.length > 0) {
        setShowListModal(true);
      } else {
        setEditingSchedule(null);
        setShowEditModal(true);
      }
    }
  };
  // const handleDateClick = (arg) => {
  //   const clickedDate = arg.dateStr; // 클릭 day
  //   const schedulesForDate = schedules.filter((s) => s.startDatetime.split('T')[0]=== clickedDate);
  //   console.log("schedulesForDate",schedulesForDate);
  //   setSelectedDate(clickedDate);
  //   if (schedulesForDate.length > 0) {
  //     setSelectedSchedules(schedulesForDate);
  //     setShowListModal(true);
  //   } else {
  //     setEditingSchedule(null);
  //     setShowEditModal(true);
  //   }
  // };
  // 일정 추가 클릭 시
  const handleAddClickFromList = () => {
    setShowListModal(false);
    setEditingSchedule(null);
    setShowEditModal(true);
  };

  // 일정 수정 클릭 시
  const handleEditSchedule = (schedule) => {
    setShowListModal(false);
    setEditingSchedule(schedule);
    setShowEditModal(true);
  };
  // 디테일 일정이 있을 시엔 그 디테일 페이지에서
  const handleEventClick = async (arg) => {
    const scheduleId = parseInt(arg.event.id); // 이벤트 id를 scheduleId로 파싱
    console.log(arg.event);
    try {
      const result = await dispatch(
        fetchSingleSchedules({ groupId, scheduleId })
      );

      if (fetchSingleSchedules.fulfilled.match(result)) {
        const schedule = result.payload;
        setEditingSchedule({
          ...schedule,
          userIndex: profile.userId === schedule.creatorId,
        });
        setSelectedDate(schedule.startDatetime.split('T')[0]); // 날짜 추출
        setShowEditModal(true); // 일정 수정 모달 열기
      } else {
        alert('일정 데이터를 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('일정 클릭 처리 오류:', error);
    }
  };
  const handleScheduleSave = async (scheduleData) => {
    try {
      if (editingSchedule) {
        await dispatch(
          updateSchedule({
            groupId,
            scheduleId: editingSchedule.scheduleId,
            date: selectedDate,
            ...scheduleData,
          })
        ).unwrap(); // ⬅️ 비동기 완료 대기
      } else {
        await dispatch(
          createSchedule({
            groupId,
            date: selectedDate,
            ...scheduleData,
          })
        ).unwrap(); // ⬅️ 비동기 완료 대기
      }

      // ⬇️ 위 작업이 끝난 후 fetchSchedules 실행
      await dispatch(fetchSchedules(groupId)).unwrap();

      setShowEditModal(false);
    } catch (error) {
      console.error('일정 저장 실패:', error);
      // 실패했을 때 사용자에게 알림 등의 추가 처리 가능
    }
  };

  // 일정 삭제 시
  const handleDeleteSchedule = async (scheduleId) => {
    await dispatch(deleteSchedule({ groupId, scheduleId })).unwrap();
    dispatch(fetchSchedules(groupId)).unwrap();
    setShowListModal(false);
    setShowEditModal(false);
  };

  const renderDayCellContent = (arg) => (
    <CustomDayCell>{arg.dayNumberText}</CustomDayCell>
  );
 const renderEventContent = (eventInfo) => {
    // eventInfo.event.extendedProps에서 creatorId를 가져옵니다.
    const creatorId = eventInfo.event.extendedProps.creatorId;
    const eventColor = userColorMap.get(creatorId) || '#D3D3D3'; // 해당 유저 색상 없으면 기본 연한 회색

    return (
      <div
        style={{
          backgroundColor: eventColor,
          borderColor: eventColor, // border도 동일 색상으로
          borderRadius: '5px',
          padding: '3px 6px',
          color: '#333333', // 텍스트 색상
          fontWeight: '500',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {eventInfo.event.title}
      </div>
    );
  };
  const handleDayCellDidMount = (arg) => {
    arg.el.style.cursor = 'pointer';
    arg.el.onmouseover = () => {
      arg.el.style.backgroundColor = '#f0f0f0'; // 항상 회색 배경
      if (isPlaceRecommendationMode) {
        arg.el.style.border = '2px solid red'; // 추천 모드일 때만 테두리
      }
    };
    arg.el.onmouseout = () => {
      arg.el.style.backgroundColor = ''; // 기본값
      arg.el.style.border = ''; // 기본값
    };
  };
 // 장소 선택 모달 내부에서 사용할 체크박스 핸들러
  const handleCheckboxChange = (info) => {
    setSelectedUserPlaces((prevSelected) => {
      // 이미 선택된 경우 제거
      if (prevSelected.some((item) => item.userName === info.userName && item.address === info.address)) {
        return prevSelected.filter((item) => !(item.userName === info.userName && item.address === info.address));
      } else {
        // 선택되지 않은 경우 추가
        return [...prevSelected, info];
      }
    });
  };

  // 장소 선택 모달에서 "선택" 버튼 클릭 시 호출될 함수
  const handleSelectUsersForRecommendation = async () => {
    console.log("selectedUserPlaces",selectedUserPlaces)
    if (selectedUserPlaces.length >= 2) {
      // 1. 로딩 모달 띄우기
      setShowLoadingModal(true);
      setShowPlaceInfoModal(false); // 장소 선택 모달 닫기
      setIsPlaceRecommendationMode(false); // 장소 추천 모드 해제

      // 2. 선택된 사용자 정보로 디스패치 (백엔드 연동)
      const payload = selectedUserPlaces.map(user => ({
        userName: user.userName,
        latitude: user.latitude,
        longitude: user.longitude,
        address: user.address
      }));

      try {
        // 실제 API 호출 (예시: loactionRecommend 액션)
        console.log("그룹 payload ", payload )
        const result = await dispatch(loactionRecommend({
  payload,
  location: selectedPlaceType
})).unwrap();
        console.log('장소 추천 API 결과:', result);
        
        // --- 백엔드 연동 시뮬레이션 (15초 로딩) ---
        const mockResult = await new Promise(resolve => {
          setTimeout(() => {
            // 가상의 추천 결과 데이터 (실제 백엔드에서 받아올 데이터 구조로 대체)
            const dummyRecommendations = [
              { name: '강남역 맛집 A', address: '서울특별시 강남구 테헤란로 123', latitude: 37.498, longitude: 127.027 },
              { name: '신촌 카페 B', address: '서울특별시 서대문구 신촌로 456', latitude: 37.558, longitude: 126.946 },
              { name: '종로 도서관 C', address: '서울특별시 종로구 종로 789', latitude: 37.570, longitude: 126.980 },
            ];
            resolve(dummyRecommendations);
          }, 10000); // 10초
        });
        // ------------------------------------------

        setRecommendedPlaces(mockResult); // 추천 결과 저장
        setShowLoadingModal(false); // 로딩 모달 닫기
        navigate('/recommendation-results', { 
            state: { recommendedPlaces: result.recommendedPlaces, groupId: groupId, userMember: result.userNames, title:result.title
              ,selectedUserPlaces: selectedUserPlaces, location: selectedPlaceTypeKR
            } 
        }); // 추천 결과와 groupId를 state로 전달


      } catch (error) {
        console.error('장소 추천 요청 실패:', error);
        alert('장소 추천에 실패했습니다. 다시 시도해 주세요.');
        setShowLoadingModal(false); // 에러 발생 시 로딩 모달 닫기
        setIsPlaceRecommendationMode(false); // 에러 발생 시 모드 해제
      }
    } else {
      alert('장소 추천을 받으려면 최소 2명 이상을 선택해야 합니다.');
    }
  };

  if (loading) return <p>불러오는 중...</p>;

  const userColorMap = new Map();
  calendarDetail.members?.forEach((member) => {
    const userId = member.userId;
    if (!userColorMap.has(userId)) {
      userColorMap.set(
        userId,
        userColors[userColorMap.size % userColors.length]
      );
    }
  });
  // https://divheer.tistory.com/168 스타일 커스텀 하는법
  return (
    <Container>
      <MainContent>
        {/* 그룹명 + 수정 버튼 */}
        <GroupHeader>
          {isEditingTitle ? (
            <>
              <GroupTitleInput
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <Button size="sm" variant="success" onClick={handleTitleSave}>
                수정
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsEditingTitle(false)}
                style={{ marginLeft: '5px' }}
              >
                취소
              </Button>
            </>
          ) : (
            <>
              <StyledGroupNameWrapper>
            <StyledCalendarIcon /> {/* 캘린더 아이콘 */}
            <StyledGroupNameText>
              {calendarDetail?.groupName}
            </StyledGroupNameText>
          </StyledGroupNameWrapper>
          <StyledEditIcon onClick={handleTitleEditClick} /> {/* 편집 아이콘 */}
            </>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <Form.Select
              value={calendarView}
              onChange={(e) => setCalendarView(e.target.value)}
            >
              <option value="dayGridMonth">월</option>
              <option value="timeGridWeek">주</option>
            </Form.Select>
          </div>
        </GroupHeader>

        {/* FullCalendar */}
        <FullCalendarWrapper>
          {isPlaceRecommendationMode && (
            <CalendarOverlay
              $showOverlay={isPlaceRecommendationMode}
              onClick={alert('날짜를 선택해주세요!')}
            />
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={calendarView}
            locales={[koLocale]}
            locale="ko"
            events={schedules?.map((schedule) => ({
              id: schedule?.scheduleId, // scheduleId를 id로
              title: schedule?.title,
              start: schedule?.startDatetime, // 시작 시간
              end: schedule?.endDatetime, // 종료 시간
              extendedProps: {
    creatorId: schedule.creatorId, // 여기서 creatorId를 이벤트 데이터에 포함시킵니다.
  },
              backgroundColor: userColorMap.get(schedule.creatorId),
              borderColor: userColorMap.get(schedule.creatorId),
            }))}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventContent={renderEventContent} // 이벤트 내용 렌더링 커스텀
            dayCellContent={renderDayCellContent}
            // 날짜 셀 렌더링 후 호출되는 콜백
            // `dateClick` 이벤트만으로는 `onmouseover` 등을 제어하기 어렵기 때문에 `dayCellDidMount`를 사용합니다.
            dayCellDidMount={handleDayCellDidMount}
          />
        </FullCalendarWrapper>
      </MainContent>
      
      <Sidebar>
        <ParticipantBox>
      <ParticipantHeader>
        <ParticipantTitle>참여자 목록</ParticipantTitle>
        {/* 참여자 수 표시 */}
        <ParticipantCount>{calendarDetail.members?.length || 0}명</ParticipantCount>
      </ParticipantHeader>
      <ParticipantList>
        {calendarDetail.members?.map((member) => (
          <ParticipantItem key={member?.userId}>
            <ColorBar color={userColorMap.get(member?.userId)} />
            <MemberName>{member?.name}</MemberName>
          </ParticipantItem>
        ))}
      </ParticipantList>
    </ParticipantBox>

        <RecommendationContainer>
      <MapBox>
        {/* 이미지를 직접 img 태그로 넣어서 애니메이션 적용 */}
        <img src={mapGifUrl} alt="지도 아이콘" />
      </MapBox>

      <DescriptionBox>
        <p>
          <strong>친구들과의 약속! <br />중간 장소를 찾고 계신가요?</strong><br /><br />
          버튼을 클릭하여 모두에게 편리한 약속 장소를 추천받아 보세요!
        </p>
        {isPlaceRecommendationMode && (
          <p style={{ color: '#007bff', fontWeight: 'bold' }}>
            현재 중간 장소 추천 모드가 활성화되었습니다.
          </p>
        )}
      </DescriptionBox>

      <RecommendButton
        variant={isPlaceRecommendationMode ? 'danger' : 'secondary'}
        onClick={() => setIsPlaceRecommendationMode(!isPlaceRecommendationMode)}
      >
        {isPlaceRecommendationMode ? '장소 추천 해제' : '중간 장소 추천'}
        <span className="rocket-icon">🚀</span>
      </RecommendButton>
    </RecommendationContainer>
      </Sidebar>

      {showListModal && (
        <Modal
          show={showListModal}
          onHide={() => setShowListModal(false)}
          centered
        >
          <ScheduleListModal
            date={selectedDate}
            schedules={selectedSchedules}
            members={calendarDetail.members || []}
            onAddClick={handleAddClickFromList}
            onEditClick={handleEditSchedule}
            onDeleteClick={handleDeleteSchedule}
            onClose={() => setShowListModal(false)}
            availableUserColors={userColors} // 색상 배열 전달
            profile={profile}
          />
        </Modal>
      )}
      {showEditModal && (
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
        >
          <ScheduleModal
            date={selectedDate}
            members={calendarDetail.members || []}
            initialData={editingSchedule}
            onSave={handleScheduleSave}
            onClose={() => setShowEditModal(false)}
            onDeleteClick={handleDeleteSchedule}
          />
        </Modal>
      )}
      {/* 장소 정보 모달 (새로운 모달) */}
      {showPlaceInfoModal && (
        <Modal
          show={showPlaceInfoModal}
          onHide={() => {setShowPlaceInfoModal(false);
            setIsPlaceRecommendationMode(false);
          }}
          centered
        >
           <PlaceRecommendModalContent>
            <CloseButtonContainer>
              <CloseButton onClick={() => {
                setShowPlaceInfoModal(false);
                setIsPlaceRecommendationMode(false); // 모달 닫을 때 모드 해제
              }}>X</CloseButton>
            </CloseButtonContainer>
            <PlaceRecommendModalHeader>
              <h4>장소 추천받을 사용자 선택</h4>
              <p>(최소 2명 이상 선택)</p>
              
            </PlaceRecommendModalHeader>
            <PlaceTypeButtonWrapper>
  <PlaceTypeButton
    $isActive={selectedPlaceType === 'cafes'}
    onClick={() => {setSelectedPlaceType('cafes');
      setSelectedPlaceTypeKR('카페');
    }}
  >
    ☕ 카페
  </PlaceTypeButton>
  <PlaceTypeButton
    $isActive={selectedPlaceType === 'foods'}
    onClick={() => {setSelectedPlaceType('foods')
      setSelectedPlaceTypeKR('음식점');
    }}
  >
    🍽️ 음식점
  </PlaceTypeButton>
</PlaceTypeButtonWrapper>
            <PlaceInfoList>
              {placeInfoForDate.length > 0 ? (
                placeInfoForDate.map((info, index) => (
                  <PlaceInfoItem 
                    key={index} 
                    $isSelected={selectedUserPlaces.some((item) => 
                      item.userName === info.userName && item.address === info.address
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserPlaces.some((item) => 
                        item.userName === info.userName && item.address === info.address
                      )}
                      onChange={() => handleCheckboxChange(info)}
                    />
                    <div>
                      <p>
                        <strong>{info.userName}의 장소:</strong> {info.address}
                      </p>
                      <span>
                        위도: {info.latitude?.toFixed(6)}, 경도:{' '}
                        {info.longitude?.toFixed(6)}
                      </span>
                    </div>
                  </PlaceInfoItem>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#777' }}>
                  이 날짜에 기록된 장소 정보가 없습니다.
                </p>
              )}
            </PlaceInfoList>

            <SelectButton 
              onClick={handleSelectUsersForRecommendation} 
              disabled={selectedUserPlaces.length < 2}
            >
              선택
            </SelectButton>
          </PlaceRecommendModalContent>
           {/* <PlaceRecommendationModal
        show={showPlaceInfoModal}
        onHide={() => setShowPlaceInfoModal(false)}
        selectedDate={selectedDate}
        placeInfoForDate={placeInfoForDate}
      /> */}
        </Modal>   
      )}
      {/* 로딩 모달 */}
      <LoadingModal show={showLoadingModal} />
      
    </Container>
  );
};

export default GroupCalendarPage;
