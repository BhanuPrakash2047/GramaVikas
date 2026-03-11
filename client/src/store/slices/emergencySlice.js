import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import apiClient from '../../services/api';

// Helper: append a file to FormData in a cross-platform way
const appendFile = async (formData, fieldName, fileObj) => {
  if (Platform.OS === 'web') {
    // On web, fetch the blob from the URI and create a real File
    const response = await fetch(fileObj.uri);
    const blob = await response.blob();
    const fileName = fileObj.fileName || fileObj.name || 'file';
    formData.append(fieldName, blob, fileName);
  } else {
    // React Native expects { uri, name, type }
    formData.append(fieldName, {
      uri: fileObj.uri,
      name: fileObj.fileName || fileObj.name || 'file',
      type: fileObj.type || 'application/octet-stream',
    });
  }
};

// ─── Async Thunks ────────────────────────────────────────────────

export const createEmergency = createAsyncThunk(
  'emergency/createEmergency',
  async (emergencyData, { rejectWithValue }) => {
    try {
      // Emergency controller returns DTO directly (not wrapped in ApiResponse)
      const response = await apiClient.post('/emergency/create', emergencyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const submitVoiceEmergency = createAsyncThunk(
  'emergency/submitVoiceEmergency',
  async ({ farmerId, latitude, longitude, voiceFile }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('farmerId', String(farmerId));
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      await appendFile(formData, 'voiceFile', {
        uri: voiceFile.uri,
        fileName: voiceFile.fileName || 'voice.wav',
        type: voiceFile.type || 'audio/wav',
      });

      const response = await apiClient.post('/emergency/voice', formData, {
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

export const submitLivestockEmergency = createAsyncThunk(
  'emergency/submitLivestockEmergency',
  async (
    { farmerId, latitude, longitude, description, image },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('farmerId', String(farmerId));
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('description', description);
      await appendFile(formData, 'image', {
        uri: image.uri,
        fileName: image.fileName || 'livestock.jpg',
        type: image.type || 'image/jpeg',
      });

      const response = await apiClient.post('/emergency/livestock', formData, {
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

// ─── Initial State ───────────────────────────────────────────────

const initialState = {
  // Create emergency
  emergencyResponse: null,
  emergencyLoading: false,
  emergencyError: null,

  // Voice emergency
  voiceEmergencyResponse: null,
  voiceEmergencyLoading: false,
  voiceEmergencyError: null,

  // Livestock emergency
  livestockEmergencyResponse: null,
  livestockEmergencyLoading: false,
  livestockEmergencyError: null,
};

// ─── Slice ───────────────────────────────────────────────────────

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    clearEmergencyState(state) {
      state.emergencyResponse = null;
      state.emergencyError = null;
      state.voiceEmergencyResponse = null;
      state.voiceEmergencyError = null;
      state.livestockEmergencyResponse = null;
      state.livestockEmergencyError = null;
    },
    clearEmergencyErrors(state) {
      state.emergencyError = null;
      state.voiceEmergencyError = null;
      state.livestockEmergencyError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Create Emergency ──
    builder
      .addCase(createEmergency.pending, (state) => {
        state.emergencyLoading = true;
        state.emergencyError = null;
        state.emergencyResponse = null;
      })
      .addCase(createEmergency.fulfilled, (state, action) => {
        state.emergencyLoading = false;
        state.emergencyResponse = action.payload;
        state.emergencyError = null;
      })
      .addCase(createEmergency.rejected, (state, action) => {
        state.emergencyLoading = false;
        state.emergencyError =
          action.payload?.message || 'Emergency creation failed';
      });

    // ── Voice Emergency ──
    builder
      .addCase(submitVoiceEmergency.pending, (state) => {
        state.voiceEmergencyLoading = true;
        state.voiceEmergencyError = null;
        state.voiceEmergencyResponse = null;
      })
      .addCase(submitVoiceEmergency.fulfilled, (state, action) => {
        state.voiceEmergencyLoading = false;
        state.voiceEmergencyResponse = action.payload;
        state.voiceEmergencyError = null;
      })
      .addCase(submitVoiceEmergency.rejected, (state, action) => {
        state.voiceEmergencyLoading = false;
        state.voiceEmergencyError =
          action.payload?.message || 'Voice emergency failed';
      });

    // ── Livestock Emergency ──
    builder
      .addCase(submitLivestockEmergency.pending, (state) => {
        state.livestockEmergencyLoading = true;
        state.livestockEmergencyError = null;
        state.livestockEmergencyResponse = null;
      })
      .addCase(submitLivestockEmergency.fulfilled, (state, action) => {
        state.livestockEmergencyLoading = false;
        state.livestockEmergencyResponse = action.payload;
        state.livestockEmergencyError = null;
      })
      .addCase(submitLivestockEmergency.rejected, (state, action) => {
        state.livestockEmergencyLoading = false;
        state.livestockEmergencyError =
          action.payload?.message || 'Livestock emergency failed';
      });
  },
});

export const { clearEmergencyState, clearEmergencyErrors } =
  emergencySlice.actions;

export default emergencySlice.reducer;
