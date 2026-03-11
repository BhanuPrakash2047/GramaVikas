import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────────

export const registerDoctor = createAsyncThunk(
  'doctor/registerDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      // DoctorController returns entity directly (not wrapped in ApiResponse)
      const response = await apiClient.post('/doctor/register', doctorData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateDoctorAvailability = createAsyncThunk(
  'doctor/updateAvailability',
  async ({ id, available }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/doctor/availability', {
        id,
        available,
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
  // Register doctor
  registeredDoctor: null,
  registerLoading: false,
  registerError: null,
  registerSuccess: false,

  // Update availability
  updateAvailabilityLoading: false,
  updateAvailabilityError: null,
  updateAvailabilitySuccess: false,
};

// ─── Slice ───────────────────────────────────────────────────────

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    clearDoctorErrors(state) {
      state.registerError = null;
      state.updateAvailabilityError = null;
    },
    clearDoctorRegisterSuccess(state) {
      state.registerSuccess = false;
    },
    clearDoctorAvailabilitySuccess(state) {
      state.updateAvailabilitySuccess = false;
    },
  },
  extraReducers: (builder) => {
    // ── Register Doctor ──
    builder
      .addCase(registerDoctor.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
        state.registerSuccess = false;
        state.registeredDoctor = null;
      })
      .addCase(registerDoctor.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.registeredDoctor = action.payload;
        state.registerSuccess = true;
        state.registerError = null;
      })
      .addCase(registerDoctor.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError =
          action.payload?.message || 'Doctor registration failed';
        state.registerSuccess = false;
      });

    // ── Update Availability ──
    builder
      .addCase(updateDoctorAvailability.pending, (state) => {
        state.updateAvailabilityLoading = true;
        state.updateAvailabilityError = null;
        state.updateAvailabilitySuccess = false;
      })
      .addCase(updateDoctorAvailability.fulfilled, (state, action) => {
        state.updateAvailabilityLoading = false;
        state.updateAvailabilitySuccess = true;
        state.updateAvailabilityError = null;
        // Update registered doctor if it's the same
        if (
          state.registeredDoctor &&
          state.registeredDoctor.id === action.payload?.id
        ) {
          state.registeredDoctor = action.payload;
        }
      })
      .addCase(updateDoctorAvailability.rejected, (state, action) => {
        state.updateAvailabilityLoading = false;
        state.updateAvailabilityError =
          action.payload?.message || 'Failed to update availability';
        state.updateAvailabilitySuccess = false;
      });
  },
});

export const {
  clearDoctorErrors,
  clearDoctorRegisterSuccess,
  clearDoctorAvailabilitySuccess,
} = doctorSlice.actions;

export default doctorSlice.reducer;
