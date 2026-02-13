import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient'; 

// --- THUNKS ---

// 1. Fetch User (Fixed: Removed garbage code)
export const fetchUser = createAsyncThunk('auth/fetchUser', 
  async () => {
    await axiosClient.get('/sanctum/csrf-cookie');
    const response = await axiosClient.get('/api/user');
    return response.data;
  }
);

// 2. Login Employee
export const loginEmployee = createAsyncThunk(
  'auth/loginEmployee',
  async (credentials, { dispatch }) => {
    await axiosClient.get('/sanctum/csrf-cookie');
    await axiosClient.post('/api/employee-login', credentials);
    const userData = await dispatch(fetchUser()).unwrap();
    return { ...userData};
  }
);

// 3. Login Student
export const loginStudent = createAsyncThunk(
  'auth/loginStudent',
  async (credentials, { dispatch }) => {
    await axiosClient.get('/sanctum/csrf-cookie');
    await axiosClient.post('/api/student-login', credentials);
    const userData = await dispatch(fetchUser()).unwrap();
    return { ...userData};
  }
);

// 4. Logou
export const logoutUser = createAsyncThunk('auth/logoutUser', 
  async () => {
    const response = await axiosClient.post('/api/logout');
    return response.data;
  }
);

// --- SLICE ---
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    user_type: null, 
    user_role_level: [], 
    status: 'idle', 
    error: null, 
  },
  reducers: {
    // Optional: Add a reducer to clear errors manually
    clearErrors: (state) => {
        state.error = null;
        state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // ===========================
      // LOGIN EMPLOYEE CASES
      // ===========================
      .addCase(loginEmployee.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginEmployee.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user || action.payload;
        state.user_type = action.payload.user_type;
        state.user_role_level = action.payload.user_role_level;
        state.status = 'succeeded';
      })
      .addCase(loginEmployee.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      })

      // ===========================
      // LOGIN STUDENT CASES
      // ===========================
      .addCase(loginStudent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginStudent.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user || action.payload; 
        state.user_type = 'Student'; 
        state.user_role_level = []; 
        state.status = 'succeeded';
      })
      .addCase(loginStudent.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      })
      
      // ===========================
      // FETCH USER CASES (Page Refresh)
      // ===========================
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        if (action.payload && action.payload.user) {
            state.isAuthenticated = true;
            state.user = action.payload.user || action.payload;
            state.user_type = action.payload.user_type || 'Student'; // Fallback if missing
            state.user_role_level = action.payload.user_role_level || [];
            state.status = 'succeeded';
        } else {
            // No user found in response
            state.isAuthenticated = false;
            state.user = null;
            state.status = 'failed'; 
        }
      })
      .addCase(fetchUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.status = 'failed';
      })

      // ===========================
      // LOGOUT CASES
      // ===========================
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.user_type = null;
        state.user_role_level = [];
        state.status = 'idle'; 
      });
  },
});

export const { clearErrors } = authSlice.actions;
export default authSlice.reducer;