import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { supabase } from '../../lib/supabaseClient';
import { showToastMessage } from '../common/uiSlice';

export const loginWithEmail = createAsyncThunk(
  'user/loginWithEmail',
  async ({ email, password, navigate }, { dispatch, rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      dispatch(
        showToastMessage({
          message: '로그인에 성공했습니다.',
          status: 'success',
        })
      );

      navigate('/');
      return data.user ?? null;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
          status: 'error',
        })
      );

      return rejectWithValue(error.message);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'user/loginWithGoogle',
  async (_, { rejectWithValue }) => rejectWithValue('Not implemented')
);

export const logout = createAsyncThunk(
  'user/logout',
  async ({ navigate } = {}, { dispatch, rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      dispatch(
        showToastMessage({
          message: '로그아웃이 완료되었습니다.',
          status: 'success',
        })
      );

      if (navigate) {
        navigate('/login');
      } else {
        window.location.href = '/login';
      }

      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async ({ values, navigate }, { dispatch, rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        await supabase.auth.signOut();
      }

      dispatch(
        showToastMessage({
          message: '회원가입에 성공했습니다.',
          status: 'success',
        })
      );

      navigate('/login');
      return {
        email: values.email,
        name: values.name,
      };
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '회원가입에 실패했습니다.',
          status: 'error',
        })
      );

      return rejectWithValue(error.message);
    }
  }
);

export const checkEmailAvailability = createAsyncThunk(
  'user/checkEmailAvailability',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/auth/check-email', {
        params: { email },
      });

      return {
        status: response.data.available ? 200 : 409,
        available: response.data.available,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || '이메일 중복 확인에 실패했습니다.'
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || '회원 정보를 불러오는 데 실패했습니다.'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put('/api/profile', payload);

      dispatch(
        showToastMessage({
          message: '회원 정보가 수정되었습니다.',
          status: 'success',
        })
      );

      return response.data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '회원 정보 수정에 실패했습니다.',
          status: 'error',
        })
      );

      return rejectWithValue(error.message || '회원 정보 수정에 실패했습니다.');
    }
  }
);

export const loginWithToken = createAsyncThunk(
  'user/loginWithToken',
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return null;
      }

      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const friendsRequest = createAsyncThunk(
  'user/friendRequest',
  async ({ receiverEmail }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/friends/request', {
        receiverEmail,
      });

      dispatch(
        showToastMessage({
          message: '친구 요청을 보냈습니다.',
          status: 'success',
        })
      );

      return response.data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '해당 이메일을 찾을 수 없습니다.',
          status: 'error',
        })
      );

      return rejectWithValue(error.message || '친구 요청에 실패했습니다.');
    }
  }
);

export const friendsPending = createAsyncThunk(
  'user/friendsPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/friends/pending');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || '친구 요청 목록 조회에 실패했습니다.');
    }
  }
);

export const friendsAccept = createAsyncThunk(
  'user/friendsAccept',
  async ({ requestId, receievId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/friends/accept', {
        requesterId: requestId,
        receiverId: receievId,
      });

      dispatch(
        showToastMessage({
          message: '친구 요청을 수락했습니다.',
          status: 'success',
        })
      );

      return response.data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '친구 요청 수락에 실패했습니다.',
          status: 'error',
        })
      );

      return rejectWithValue(error.message || '친구 요청 수락에 실패했습니다.');
    }
  }
);

export const friendsDecline = createAsyncThunk(
  'user/friendsDecline',
  async ({ requestId, receievId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/friends/decline', {
        requesterId: requestId,
        receiverId: receievId,
      });

      dispatch(
        showToastMessage({
          message: '친구 요청을 거절했습니다.',
          status: 'error',
        })
      );

      return response.data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '친구 요청 거절에 실패했습니다.',
          status: 'error',
        })
      );

      return rejectWithValue(error.message || '친구 요청 거절에 실패했습니다.');
    }
  }
);

export const fetchFriendsList = createAsyncThunk(
  'user/fetchFriendsList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/friends/list');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || '친구 목록 조회에 실패했습니다.');
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  loginError: null,
  registrationError: null,
  success: false,
  profile: null,
  emailmessage: '',
  checkEmailError: null,
  friendsRequestList: [],
  friendsList: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
      state.emailmessage = '';
      state.checkEmailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registrationError = action.payload;
      })
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.loginError = null;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
      .addCase(loginWithToken.fulfilled, (state, action) => {
        state.user = action.payload?.data ?? action.payload ?? null;
      })
      .addCase(checkEmailAvailability.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkEmailAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.emailmessage = action.payload.message;
        state.checkEmailError = null;
      })
      .addCase(checkEmailAvailability.rejected, (state, action) => {
        state.loading = false;
        state.emailmessage = '';
        state.checkEmailError = action.payload;
      })
      .addCase(friendsPending.pending, (state) => {
        state.loading = true;
      })
      .addCase(friendsPending.fulfilled, (state, action) => {
        state.loading = false;
        state.friendsRequestList = action.payload;
      })
      .addCase(friendsPending.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
        state.user = action.payload.data;
        state.loginError = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
      .addCase(fetchFriendsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFriendsList.fulfilled, (state, action) => {
        state.loading = false;
        state.friendsList = action.payload.data;
        state.loginError = null;
      })
      .addCase(fetchFriendsList.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
      .addCase(logout.fulfilled, () => ({
        ...initialState,
      }));
  },
});

export const { clearErrors, setUser } = userSlice.actions;
export default userSlice.reducer;
