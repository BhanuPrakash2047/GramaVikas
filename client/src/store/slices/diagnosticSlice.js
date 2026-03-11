import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────────

export const diagnoseWeb = createAsyncThunk(
  'diagnostic/diagnoseWeb',
  async ({ userQuery, farmerId, language, region, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('userQuery', userQuery);
      if (farmerId) formData.append('farmerId', farmerId);
      if (language) formData.append('language', language);
      if (region) formData.append('region', region);
      if (image) {
        formData.append('image', {
          uri: image.uri,
          name: image.fileName || 'image.jpg',
          type: image.type || 'image/jpeg',
        });
      }

      const response = await apiClient.post('/diagnostic/web', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const fetchDiagnosticHistory = createAsyncThunk(
  'diagnostic/fetchHistory',
  async (farmerId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/diagnostic/history/${farmerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const fetchFarmerDashboard = createAsyncThunk(
  'diagnostic/fetchFarmerDashboard',
  async (farmerId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/diagnostic/dashboard/${farmerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const fetchLocationDashboard = createAsyncThunk(
  'diagnostic/fetchLocationDashboard',
  async ({ mandal, district = 'Srikakulam' }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/diagnostic/dashboard/location', {
        params: { mandal, district },
      });
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
  // Diagnosis result
  diagnosisResult: null,
  diagnosisLoading: false,
  diagnosisError: null,

  // Diagnosis history
  history: [],
  historyLoading: false,
  historyError: null,

  // Agri Dashboard
  dashboard: null,
  dashboardLoading: false,
  dashboardError: null,
};

// ─── Slice ───────────────────────────────────────────────────────

const diagnosticSlice = createSlice({
  name: 'diagnostic',
  initialState,
  reducers: {
    clearDiagnosisResult(state) {
      state.diagnosisResult = null;
      state.diagnosisError = null;
    },
    clearDiagnosticErrors(state) {
      state.diagnosisError = null;
      state.historyError = null;
      state.dashboardError = null;
    },
    clearDashboard(state) {
      state.dashboard = null;
      state.dashboardError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Diagnose Web ──
    builder
      .addCase(diagnoseWeb.pending, (state) => {
        state.diagnosisLoading = true;
        state.diagnosisError = null;
        state.diagnosisResult = null;
      })
      .addCase(diagnoseWeb.fulfilled, (state, action) => {
        state.diagnosisLoading = false;
        state.diagnosisResult = action.payload?.data || null;
        state.diagnosisError = null;
      })
      .addCase(diagnoseWeb.rejected, (state, action) => {
        state.diagnosisLoading = false;
        state.diagnosisError = action.payload?.message || 'Diagnosis failed';
      });

    // ── Fetch History ──
    builder
      .addCase(fetchDiagnosticHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchDiagnosticHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload?.data || [];
        state.historyError = null;
      })
      .addCase(fetchDiagnosticHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError =
          action.payload?.message || 'Failed to fetch diagnosis history';
      });

    // ── Farmer Dashboard ──
    builder
      .addCase(fetchFarmerDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchFarmerDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload?.data || null;
        state.dashboardError = null;
      })
      .addCase(fetchFarmerDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError =
          action.payload?.message || 'Failed to load dashboard';
      });

    // ── Location Dashboard ──
    builder
      .addCase(fetchLocationDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchLocationDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload?.data || null;
        state.dashboardError = null;
      })
      .addCase(fetchLocationDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError =
          action.payload?.message || 'Failed to load location dashboard';
      });
  },
});

export const {
  clearDiagnosisResult,
  clearDiagnosticErrors,
  clearDashboard,
} = diagnosticSlice.actions;

export default diagnosticSlice.reducer;
