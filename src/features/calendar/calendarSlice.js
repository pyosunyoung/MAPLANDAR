import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api'; // api.js가 'src/utils/api.js'에 있을 경우

import { showToastMessage } from '../common/uiSlice';

export const createCalendar = createAsyncThunk(
  'calendar/createCalendar',
  async ({  groupName,calendarName, memberIds }, { dispatch, rejectWithValue }) => {
    try {
      console.log("groupName,calendarName, memberIds ", groupName,calendarName, memberIds );
      const response = await api.post('/api/groups', 
        {
          groupName : groupName,
          calendarName : calendarName,
          memberIds : memberIds,
        }
      );
      dispatch(
        showToastMessage({
          message: '캘린더를 생성하였습니다!',
          status: 'success',
        })
      );
      console.log("캘린더 생성 데이터",response.data);
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
      
      const response = await api.get('/api/groups', 
      );
      console.log("캘린더 리스트", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || '캘린더 리스트 조회 실패.');
    }
  }
);

export const fetchCalendarDetail = createAsyncThunk(
  'calendar/fetchCalendarDetail',
  async (groupId, { dispatch, rejectWithValue }) => {
    try {
      
      const response = await api.get(`/api/groups/${groupId}`, 
      );
      console.log("캘린더 디테일 리스트", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || '캘린더 디테일 리스트 조회 실패.');
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
    friendsRequestList:[],
    friendsList:[],
    calendarList:[],
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
        state.calendarList = action.payload;
      }) 
      .addCase(fetchCalendarDetail.rejected, (state, action) => {
        state.error = action.payload;
      }) 
  },
});
export const { clearErrors } = calendarSlice.actions;
export default calendarSlice.reducer;
