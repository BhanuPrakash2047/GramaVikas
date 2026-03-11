import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────────

export const registerDriver = createAsyncThunk(
  'driver/registerDriver',
  async (driverData, { rejectWithValue }) => {
    try {
      // DriverController returns entity directly (not wrapped in ApiResponse)
      const response = await apiClient.post('/driver/register', driverData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateDriverAvailability = createAsyncThunk(
  'driver/updateAvailability',
  async ({ id, available }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/driver/availability', {
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

export const fetchNearbyDrivers = createAsyncThunk(
  'driver/fetchNearbyDrivers',
  async ({ latitude, longitude, radiusKm = 5.0 }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/driver/nearby', {
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

// ─── Initial State ───────────────────────────────────────────────

const initialState = {
  // Register driver
  registeredDriver: null,
  registerLoading: false,
  registerError: null,
  registerSuccess: false,

  // Update availability
  updateAvailabilityLoading: false,
  updateAvailabilityError: null,
  updateAvailabilitySuccess: false,

  // Nearby drivers
  nearbyDrivers: [],
  nearbyDriversLoading: false,
  nearbyDriversError: null,
};

// ─── Slice ───────────────────────────────────────────────────────

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    clearDriverErrors(state) {
      state.registerError = null;
      state.updateAvailabilityError = null;
      state.nearbyDriversError = null;
    },
    clearDriverRegisterSuccess(state) {
      state.registerSuccess = false;
    },
    clearDriverAvailabilitySuccess(state) {
      state.updateAvailabilitySuccess = false;
    },
  },
  extraReducers: (builder) => {
    // ── Register Driver ──
    builder
      .addCase(registerDriver.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
        state.registerSuccess = false;
        state.registeredDriver = null;
      })
      .addCase(registerDriver.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.registeredDriver = action.payload;
        state.registerSuccess = true;
        state.registerError = null;
      })
      .addCase(registerDriver.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError =
          action.payload?.message || 'Driver registration failed';
        state.registerSuccess = false;
      });

    // ── Update Availability ──
    builder
      .addCase(updateDriverAvailability.pending, (state) => {
        state.updateAvailabilityLoading = true;
        state.updateAvailabilityError = null;
        state.updateAvailabilitySuccess = false;
      })
      .addCase(updateDriverAvailability.fulfilled, (state, action) => {
        state.updateAvailabilityLoading = false;
        state.updateAvailabilitySuccess = true;
        state.updateAvailabilityError = null;
        // Update registered driver if it's the same
        if (
          state.registeredDriver &&
          state.registeredDriver.id === action.payload?.id
        ) {
          state.registeredDriver = action.payload;
        }
        // Update in nearby list
        const idx = state.nearbyDrivers.findIndex(
          (d) => d.id === action.payload?.id
        );
        if (idx !== -1) {
          state.nearbyDrivers[idx] = action.payload;
        }
      })
      .addCase(updateDriverAvailability.rejected, (state, action) => {
        state.updateAvailabilityLoading = false;
        state.updateAvailabilityError =
          action.payload?.message || 'Failed to update availability';
        state.updateAvailabilitySuccess = false;
      });

    // ── Nearby Drivers ──
    builder
      .addCase(fetchNearbyDrivers.pending, (state) => {
        state.nearbyDriversLoading = true;
        state.nearbyDriversError = null;
      })
      .addCase(fetchNearbyDrivers.fulfilled, (state, action) => {
        state.nearbyDriversLoading = false;
        // DriverController returns List<Driver> directly
        state.nearbyDrivers = action.payload || [];
        state.nearbyDriversError = null;
      })
      .addCase(fetchNearbyDrivers.rejected, (state, action) => {
        state.nearbyDriversLoading = false;
        state.nearbyDriversError =
          action.payload?.message || 'Failed to fetch nearby drivers';
      });
  },
});

export const {
  clearDriverErrors,
  clearDriverRegisterSuccess,
  clearDriverAvailabilitySuccess,
} = driverSlice.actions;

export default driverSlice.reducer;
