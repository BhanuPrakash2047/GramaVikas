import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────────

// Note: IVRS endpoints are Twilio webhooks that return TwiML (XML).
// These thunks are for any client-side triggering or testing.

export const triggerIncomingCall = createAsyncThunk(
  'ivrs/triggerIncomingCall',
  async ({ callSid, from }, { rejectWithValue }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('CallSid', callSid);
      formData.append('From', from);

      const response = await apiClient.post('/ivrs/incoming', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const submitMenuSelection = createAsyncThunk(
  'ivrs/submitMenuSelection',
  async ({ callSid, digits }, { rejectWithValue }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('callSid', callSid);
      formData.append('Digits', digits);

      const response = await apiClient.post('/ivrs/menu', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const processSymptoms = createAsyncThunk(
  'ivrs/processSymptoms',
  async ({ callSid, speechResult }, { rejectWithValue }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('callSid', callSid);
      formData.append('SpeechResult', speechResult);

      const response = await apiClient.post('/ivrs/process-symptoms', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
  // Incoming call
  incomingCallResponse: null,
  incomingCallLoading: false,
  incomingCallError: null,

  // Menu selection
  menuResponse: null,
  menuLoading: false,
  menuError: null,

  // Symptoms processing
  symptomsResponse: null,
  symptomsLoading: false,
  symptomsError: null,
};

// ─── Slice ───────────────────────────────────────────────────────

const ivrsSlice = createSlice({
  name: 'ivrs',
  initialState,
  reducers: {
    clearIvrsState(state) {
      state.incomingCallResponse = null;
      state.incomingCallError = null;
      state.menuResponse = null;
      state.menuError = null;
      state.symptomsResponse = null;
      state.symptomsError = null;
    },
    clearIvrsErrors(state) {
      state.incomingCallError = null;
      state.menuError = null;
      state.symptomsError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Incoming Call ──
    builder
      .addCase(triggerIncomingCall.pending, (state) => {
        state.incomingCallLoading = true;
        state.incomingCallError = null;
        state.incomingCallResponse = null;
      })
      .addCase(triggerIncomingCall.fulfilled, (state, action) => {
        state.incomingCallLoading = false;
        state.incomingCallResponse = action.payload;
        state.incomingCallError = null;
      })
      .addCase(triggerIncomingCall.rejected, (state, action) => {
        state.incomingCallLoading = false;
        state.incomingCallError =
          action.payload?.message || 'Incoming call handling failed';
      });

    // ── Menu Selection ──
    builder
      .addCase(submitMenuSelection.pending, (state) => {
        state.menuLoading = true;
        state.menuError = null;
        state.menuResponse = null;
      })
      .addCase(submitMenuSelection.fulfilled, (state, action) => {
        state.menuLoading = false;
        state.menuResponse = action.payload;
        state.menuError = null;
      })
      .addCase(submitMenuSelection.rejected, (state, action) => {
        state.menuLoading = false;
        state.menuError =
          action.payload?.message || 'Menu selection failed';
      });

    // ── Process Symptoms ──
    builder
      .addCase(processSymptoms.pending, (state) => {
        state.symptomsLoading = true;
        state.symptomsError = null;
        state.symptomsResponse = null;
      })
      .addCase(processSymptoms.fulfilled, (state, action) => {
        state.symptomsLoading = false;
        state.symptomsResponse = action.payload;
        state.symptomsError = null;
      })
      .addCase(processSymptoms.rejected, (state, action) => {
        state.symptomsLoading = false;
        state.symptomsError =
          action.payload?.message || 'Symptoms processing failed';
      });
  },
});

export const { clearIvrsState, clearIvrsErrors } = ivrsSlice.actions;

export default ivrsSlice.reducer;
