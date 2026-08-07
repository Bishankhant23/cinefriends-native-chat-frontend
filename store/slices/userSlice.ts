import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiInstance from '../../services/apiInstance';
import storageService from '../../services/storageService';

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  profilePic?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'user/login',
  async (credentials: { loginIdentifier: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiInstance.post('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data;
      await storageService.setItem('userToken', accessToken);
      await storageService.setItem('refreshToken', refreshToken);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const loginWithCineFriendsThunk = createAsyncThunk(
  'user/loginWithCineFriends',
  async (credentials: { loginIdentifier: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiInstance.post('/auth/cinefriends-login', credentials);
      const { user, accessToken, refreshToken } = response.data;
      await storageService.setItem('userToken', accessToken);
      await storageService.setItem('refreshToken', refreshToken);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'CineFriends authentication failed. Check credentials.');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'user/register',
  async (userData: { email: string; username: string; password: string; name?: string }, { rejectWithValue }) => {
    try {
      const response = await apiInstance.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data;
      await storageService.setItem('userToken', accessToken);
      await storageService.setItem('refreshToken', refreshToken);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const checkAuthThunk = createAsyncThunk('user/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const token = await storageService.getItem('userToken');
    if (!token) return null;
    const response = await apiInstance.get('/auth/me');
    return response.data.user;
  } catch (error: any) {
    await storageService.removeItem('userToken');
    await storageService.removeItem('refreshToken');
    return rejectWithValue('Session expired');
  }
});

export const logoutThunk = createAsyncThunk('user/logout', async () => {
  await storageService.removeItem('userToken');
  await storageService.removeItem('refreshToken');
  return null;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // CineFriends Login
      .addCase(loginWithCineFriendsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithCineFriendsThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginWithCineFriendsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Check Auth
      .addCase(checkAuthThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthThunk.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
