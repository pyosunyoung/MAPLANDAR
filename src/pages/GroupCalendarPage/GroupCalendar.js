import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCalendarDetail } from '../../features/calendar/calendarSlice';

const GroupCalendarPage = () => {
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const { calendarInfo, members, loading } = useSelector((state) => state.calendar);

  useEffect(() => {
    dispatch(fetchCalendarDetail(groupId));
  }, [dispatch, groupId]);

  if (loading) return <p>불러오는 중...</p>;

  return (
    <div>
      <h2>📅 {calendarInfo?.calendarName}</h2>
      <p>👥 그룹: {calendarInfo?.groupName}</p>
      <ul>
        {members?.map((member) => (
          <li key={member.userId}>{member.name}</li>
        ))}
      </ul>
      {/* 여기서 실제 캘린더 UI를 이어서 구성 */}
    </div>
  );
};

export default GroupCalendarPage;
