import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api'; // api.js가 'src/utils/api.js'에 있을 경우

import { showToastMessage } from '../common/uiSlice';

export const createCalendar = createAsyncThunk(
  'calendar/createCalendar',
  async (
    { groupName, calendarName, memberIds },
    { dispatch, rejectWithValue }
  ) => {
    try {
      console.log(
        'groupName,calendarName, memberIds ',
        groupName,
        calendarName,
        memberIds
      );
      const response = await api.post('/api/groups', {
        groupName: groupName,
        calendarName: calendarName,
        memberIds: memberIds,
      });
      dispatch(
        showToastMessage({
          message: '캘린더를 생성하였습니다!',
          status: 'success',
        })
      );
      console.log('캘린더 생성 데이터', response.data);
      return response.data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '캘린더를 생성 실패',
          status: 'error',
        })
      );
      return rejectWithValue(error.response?.data || '캘린더를 생성 실패');
    }
  }
);

export const fetchCalendarList = createAsyncThunk(
  'calendar/fetchCalendarList',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.get('/api/groups');
      console.log('캘린더 리스트', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || '캘린더 리스트 조회 실패.'
      );
    }
  }
);

export const fetchCalendarDetail = createAsyncThunk(
  'calendar/fetchCalendarDetail',
  async (groupId, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.get(`/api/groups/${groupId}`);
      console.log('캘린더 디테일 리스트', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || '캘린더 디테일 리스트 조회 실패.'
      );
    }
  }
);

export const createSchedule = createAsyncThunk(
  'calendar/createSchedule',
  async (
    {
      groupId,
      title,
      description,
      address,
      startDatetime,
      endDatetime,
      date,
      latitude,
      longitude,
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      console.log(
        '일정 생성',
        groupId,
        title,
        description,
        address,
        startDatetime,
        endDatetime,
        date,
        latitude,
        longitude
      );
      const response = await api.post(`/api/groups/${groupId}/schedules`, {
        title,
        description,
        startDatetime,
        endDatetime,
        latitude,
        longitude,
        address,
      });
      dispatch(
        showToastMessage({
          message: '일정을 생성했습니다!',
          status: 'success',
        })
      );
      return response.data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '일정을 생성 실패',
          status: 'error',
        })
      );
      return rejectWithValue(
        error.response?.data || '해당 일정을 찾을 수 없습니다.'
      );
    }
  }
);

export const fetchSchedules = createAsyncThunk(
  'calendar/fetchSchedules',
  async (groupId) => {
    const response = await api.get(`/api/groups/${groupId}/schedules`);
    console.log('스케줄 그룹별 일정 조회', response.data);
    return response.data;
  }
);

export const fetchSingleSchedules = createAsyncThunk(
  'calendar/fetchSingleSchedules',
  async ({ groupId, scheduleId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/groups/${groupId}/schedules/${scheduleId}`
      );
      console.log('스케줄 단일 그룹 일정 조회', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || '단일 그룹 조회 실패.');
    }
  }
);

export const fetchSchedulesByDate = createAsyncThunk(
  'calendar/fetchSchedulesByDate',
  async ({ groupId, clickedDate }, { dispatch, rejectWithValue }) => {
    try {
      console.log(clickedDate);
      const response = await api.get(`/api/groups/${groupId}/schedules`,{}, {
        params: { date: clickedDate },
      });
      console.log('날짜별 일정 조회', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || '스케줄 전체 일정 조회 실패.'
      );
    }
  }
);
export const updateSchedule = createAsyncThunk(
  'calendar/updateSchedule',
  async (
    {
      groupId,
      scheduleId,
      title,
      description,
      startDatetime,
      endDatetime,
      latitude,
      longitude,
      address,
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/api/groups/${groupId}/schedules/${scheduleId}`,
        {
          title,
          description,
          startDatetime,
          endDatetime,
          latitude,
          longitude,
          address,
        }
      );
      dispatch(
        showToastMessage({
          message: '일정을 수정했습니다!',
          status: 'success',
        })
      );
      return response.data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '일정 수정 실패',
          status: 'error',
        })
      );
      return rejectWithValue(
        error.response?.data || '스케줄 전체 일정 조회 실패.'
      );
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  'calendar/deleteSchedule',
  async ({groupId, scheduleId}, { dispatch, rejectWithValue }) => {
    try{
      await api.delete(`/api/groups/${groupId}/schedules/${scheduleId}`);
      dispatch(
        showToastMessage({
          message: '일정을 삭제했습니다.',
          status: 'success',
        })
      );
    return scheduleId;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '일정 삭제 실패',
          status: 'error',
        })
      );
      return rejectWithValue(
        error.response?.data || '일정 삭제 실패.'
      );
    }
  }
);

export const updateGroupName = createAsyncThunk(
  'calendar/updateGroupName',
  async ({ groupId, groupName }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/api/groups/${groupId}`, { groupName });
      dispatch(
        showToastMessage({
          message: '그룹 이름 변경 성공!',
          status: 'success',
        })
      );
      return response.data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '그룹 이름 변경 실패',
          status: 'error',
        })
      );
      return rejectWithValue(
        error.response?.data || '해당 이메일을 찾을 수 없습니다.'
      );
    }
  }
);
export const loactionRecommend = createAsyncThunk(
  'calendar/loactionRecommend',
  async (payload, { dispatch, rejectWithValue }) => {
    console.log("payload값",payload);
    try {
      // console.log("uservalues", values);
      const response = await api.post('/api/locations/recommend', 
        payload,
      );

      dispatch(
        showToastMessage({
          message: '장소 추천을 성공했습니다!',
          status: 'success',
        })
      );
      console.log("장소 추천 데이터",response.data);

      return response.data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '장소 추천 실패했습니다.',
          status: 'error',
        })
      );
      return rejectWithValue(error.response?.data || '회원가입 실패');
    }
  }
);

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
    friendsRequestList: [],
    friendsList: [],
    calendarList: [],
    calendarDetail: [],
    schedules: [],
    singleSchedules: [],
  },
  reducers: {
    // 직접적으로 호출
    setUser: (state, action) => {
      state.user = action.payload; // user 정보 업데이트
    },
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
      state.emailmessage = '';
      state.checkEmailError = '';
    },
  },
  extraReducers: (builder) => {
    // async처럼 외부의 함수를 통해 호출
    builder
      .addCase(createCalendar.pending, (state) => {
        // 데이터 기다림, state는 initialState를 넘겨줌
        state.loading = true; // 로딩스피너
      })
      .addCase(createCalendar.fulfilled, (state) => {
        state.loading = false;
        state.registrationError = null;
      }) // 성공
      .addCase(createCalendar.rejected, (state, action) => {
        state.registrationError = action.payload;
      }) // 실패
      .addCase(fetchCalendarList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCalendarList.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.calendarList = action.payload;
      })
      .addCase(fetchCalendarList.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchCalendarDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCalendarDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.calendarDetail = action.payload;
      })
      .addCase(fetchCalendarDetail.rejected, (state, action) => {
        state.error = action.payload;
      })
      // updateGroupName
      .addCase(updateGroupName.fulfilled, (state, action) => {
        state.calendarDetail.groupName = action.payload.groupName;
      })
      // fetchSchedules
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchSingleSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.singleSchedules = action.payload;
      })
      .addCase(fetchSingleSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // createSchedule
      .addCase(createSchedule.fulfilled, (state, action) => {
        // state.schedules.push(action.payload); // 일정 추가 후 바로 반영
      })
      // 일정 수정
      // .addCase(updateSchedule.fulfilled, (state, action) => {
      //   const index = state.schedules.findIndex(
      //     (schedule) => schedule.id === action.payload.id
      //   );
      //   if (index !== -1) {
      //     state.schedules[index] = action.payload;
      //   }
      // })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.map((schedule) =>
          schedule.id === action.payload.id ? action.payload : schedule
        );
      })
      // 일정 삭제
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter(
          (schedule) => schedule.id !== action.payload
        );
      });
  },
});
export const { clearErrors } = calendarSlice.actions;
export default calendarSlice.reducer;
