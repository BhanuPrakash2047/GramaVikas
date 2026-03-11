import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────────

export const registerFarmer = createAsyncThunk(
  'auth/registerFarmer',
  async (registerData, { rejectWithValue }) => {
    try {
      console.log('[registerFarmer] payload:', JSON.stringify(registerData));
      const response = await apiClient.post('/farmers/register', registerData);
      return response.data;
    } catch (error) {
      console.error('[registerFarmer] error:', error.response?.data);
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const loginFarmer = createAsyncThunk(
  'auth/loginFarmer',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/farmers/login', loginData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/farmers/change-password', passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (userName, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/farmers/profile/${userName}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/farmers/validate-token');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateFarmerLocation = createAsyncThunk(
  'auth/updateFarmerLocation',
  async ({ farmerId, latitude, longitude }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/farmers/${farmerId}/location`, {
        latitude,
        longitude,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const fetchNearbyFarmers = createAsyncThunk(
  'auth/fetchNearbyFarmers',
  async ({ latitude, longitude, radiusKm = 5.0 }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/farmers/nearby', {
        params: { latitude, longitude, radiusKm },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateFarmerLanguage = createAsyncThunk(
  'auth/updateFarmerLanguage',
  async ({ farmerId, language }, { rejectWithValue }) => {
    try {
      // language should be the backend enum value: ENGLISH, HINDI, TELUGU
      const response = await apiClient.put(
        `/farmers/${farmerId}/language`,
        null,
        { params: { language } }
      );
      return { ...response.data, language };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateFarmerProfile = createAsyncThunk(
  'auth/updateFarmerProfile',
  async ({ farmerId, profileData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/farmers/${farmerId}/profile`,
        profileData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// ─── Initial State ───────────────────────────────────────────────

const initialState = {
  // Auth
  token: null,
  isAuthenticated: false,
  userName: null,

  // User profile
  profile: null,
  profileLoading: false,
  profileError: null,

  // Register
  registerLoading: false,
  registerError: null,
  registerSuccess: false,

  // Login
  loginLoading: false,
  loginError: null,

  // Change password
  changePasswordLoading: false,
  changePasswordError: null,
  changePasswordSuccess: false,

  // Token validation
  tokenValid: null,
  tokenValidating: false,

  // Location update
  locationUpdateLoading: false,
  locationUpdateError: null,
  locationUpdateSuccess: false,

  // Nearby farmers
  nearbyFarmers: [],
  nearbyFarmersLoading: false,
  nearbyFarmersError: null,

  // Language update
  languageUpdateLoading: false,
  languageUpdateError: null,

  // Profile update
  profileUpdateLoading: false,
  profileUpdateError: null,
  profileUpdateSuccess: false,
};

// ─── Slice ───────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.isAuthenticated = false;
      state.userName = null;
      state.profile = null;
      state.profileLoading = false;
      state.profileError = null;
      state.registerSuccess = false;
      state.changePasswordSuccess = false;
      state.nearbyFarmers = [];
    },
    clearAuthErrors(state) {
      state.registerError = null;
      state.loginError = null;
      state.changePasswordError = null;
      state.profileError = null;
      state.nearbyFarmersError = null;
      state.locationUpdateError = null;
      state.languageUpdateError = null;
    },
    clearRegisterSuccess(state) {
      state.registerSuccess = false;
    },
    clearChangePasswordSuccess(state) {
      state.changePasswordSuccess = false;
    },
    clearLocationUpdateSuccess(state) {
      state.locationUpdateSuccess = false;
    },
    clearProfileUpdateSuccess(state) {
      state.profileUpdateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // ── Register ──
    builder
      .addCase(registerFarmer.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
        state.registerSuccess = false;
      })
      .addCase(registerFarmer.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.registerSuccess = true;
        state.registerError = null;
      })
      .addCase(registerFarmer.rejected, (state, action) => {
        state.registerLoading = false;
        // payload.data contains the actual exception message from backend
        state.registerError =
          action.payload?.data ||
          action.payload?.message ||
          'Registration failed';
        state.registerSuccess = false;
      });

    // ── Login ──
    builder
      .addCase(loginFarmer.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(loginFarmer.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.loginError = null;
        const data = action.payload?.data;
        state.token = data?.token || null;
        state.userName = data?.userName || null;
        state.isAuthenticated = !!data?.token;
      })
      .addCase(loginFarmer.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload?.message || 'Login failed';
        state.isAuthenticated = false;
        state.token = null;
      });

    // ── Change Password ──
    builder
      .addCase(changePassword.pending, (state) => {
        state.changePasswordLoading = true;
        state.changePasswordError = null;
        state.changePasswordSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordLoading = false;
        state.changePasswordSuccess = true;
        state.changePasswordError = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordError =
          action.payload?.message || 'Password change failed';
        state.changePasswordSuccess = false;
      });

    // ── Fetch Profile ──
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload?.data || null;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload?.message || 'Failed to fetch profile';
      });

    // ── Validate Token ──
    builder
      .addCase(validateToken.pending, (state) => {
        state.tokenValidating = true;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.tokenValidating = false;
        state.tokenValid = action.payload?.data ?? false;
        if (!action.payload?.data) {
          state.isAuthenticated = false;
          state.token = null;
        }
      })
      .addCase(validateToken.rejected, (state) => {
        state.tokenValidating = false;
        state.tokenValid = false;
        state.isAuthenticated = false;
        state.token = null;
      });

    // ── Update Location ──
    builder
      .addCase(updateFarmerLocation.pending, (state) => {
        state.locationUpdateLoading = true;
        state.locationUpdateError = null;
        state.locationUpdateSuccess = false;
      })
      .addCase(updateFarmerLocation.fulfilled, (state) => {
        state.locationUpdateLoading = false;
        state.locationUpdateSuccess = true;
        state.locationUpdateError = null;
      })
      .addCase(updateFarmerLocation.rejected, (state, action) => {
        state.locationUpdateLoading = false;
        state.locationUpdateError =
          action.payload?.message || 'Location update failed';
        state.locationUpdateSuccess = false;
      });

    // ── Nearby Farmers ──
    builder
      .addCase(fetchNearbyFarmers.pending, (state) => {
        state.nearbyFarmersLoading = true;
        state.nearbyFarmersError = null;
      })
      .addCase(fetchNearbyFarmers.fulfilled, (state, action) => {
        state.nearbyFarmersLoading = false;
        state.nearbyFarmers = action.payload?.data || [];
        state.nearbyFarmersError = null;
      })
      .addCase(fetchNearbyFarmers.rejected, (state, action) => {
        state.nearbyFarmersLoading = false;
        state.nearbyFarmersError =
          action.payload?.message || 'Failed to fetch nearby farmers';
      });

    // ── Update Language ──
    builder
      .addCase(updateFarmerLanguage.pending, (state) => {
        state.languageUpdateLoading = true;
        state.languageUpdateError = null;
      })
      .addCase(updateFarmerLanguage.fulfilled, (state, action) => {
        state.languageUpdateLoading = false;
        state.languageUpdateError = null;
        // Update the language in the profile
        if (state.profile) {
          state.profile.language = action.payload.language;
        }
      })
      .addCase(updateFarmerLanguage.rejected, (state, action) => {
        state.languageUpdateLoading = false;
        state.languageUpdateError =
          action.payload?.message || 'Language update failed';
      });

    // ── Update Profile ──
    builder
      .addCase(updateFarmerProfile.pending, (state) => {
        state.profileUpdateLoading = true;
        state.profileUpdateError = null;
        state.profileUpdateSuccess = false;
      })
      .addCase(updateFarmerProfile.fulfilled, (state, action) => {
        state.profileUpdateLoading = false;
        state.profileUpdateSuccess = true;
        state.profileUpdateError = null;
        // Update profile with the returned data
        state.profile = action.payload?.data || state.profile;
      })
      .addCase(updateFarmerProfile.rejected, (state, action) => {
        state.profileUpdateLoading = false;
        state.profileUpdateError =
          action.payload?.data || action.payload?.message || 'Profile update failed';
        state.profileUpdateSuccess = false;
      });
  },
});

export const {
  logout,
  clearAuthErrors,
  clearRegisterSuccess,
  clearChangePasswordSuccess,
  clearLocationUpdateSuccess,
  clearProfileUpdateSuccess,
} = authSlice.actions;

export default authSlice.reducer;
